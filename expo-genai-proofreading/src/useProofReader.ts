import { useCallback, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import { EventEmitter, EventSubscription } from "expo-modules-core";
import {
  FeatureStatus,
  InputType,
  Language,
} from "./ExpoGenaiProofreading.types";
import Proofreader from "./ExpoGenaiProofreadingModule";

// Define the event map for download progress
type DownloadProgressEvent = {
  status: "started" | "progress" | "failed";
  bytesToDownload?: number;
  totalBytesDownloaded?: number;
  error?: string;
};

type ProofreaderEvents = {
  onDownloadProgress: (event: DownloadProgressEvent) => void;
};

// 1. Create the emitter attached to the Native Module with explicit event types
const emitter = new EventEmitter<ProofreaderEvents>(Proofreader);

const useProofReader = ({
  inputType = "KEYBOARD",
  language = "ENGLISH",
}: {
  language: Language;
  inputType: InputType;
}) => {
  const [status, setStatus] = useState<FeatureStatus | "UNINITIALIZED">(
    "UNINITIALIZED",
  );
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Add Progress State
  const [downloadProgress, setDownloadProgress] = useState({
    totalBytes: 0,
    downloadedBytes: 0,
    percentage: 0,
  });

  // 3. Use Refs for zero-cost tracking to prevent JS thread bottlenecking
  const lastPercentageRef = useRef(0);
  const totalBytesRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let progressSubscription: EventSubscription | null = null;

    async function initClient() {
      if (Platform.OS !== "android") {
        if (isMounted)
          setError("Proofreading is currently an Android-only feature.");
        return;
      }

      try {
        // Initialize Native ML Kit Client

        await Proofreader.initialize(inputType, language);

        // Check Device Hardware/Model Status
        const currentStatus = await Proofreader.checkFeatureStatus();

        if (isMounted) setStatus(currentStatus);

        // Auto-download Gemini Nano Model if needed
        if (
          currentStatus === "DOWNLOADABLE" ||
          currentStatus === "DOWNLOADING"
        ) {
          if (isMounted) setIsDownloading(true);

          // 4. Attach Listener BEFORE triggering the download Promise
          progressSubscription = emitter.addListener(
            "onDownloadProgress",
            (event) => {
              if (!isMounted) return;
              console.log(event);
              if (event.status === "started") {
                totalBytesRef.current = event.bytesToDownload ?? 0;
                setDownloadProgress({
                  totalBytes: event.bytesToDownload ?? 0,
                  downloadedBytes: 0,
                  percentage: 0,
                });
              } else if (event.status === "progress") {
                const downloaded = event.totalBytesDownloaded;
                const total = totalBytesRef.current;

                if (total > 0) {
                  // Calculate integer percentage (0-100)
                  const percentage = Math.floor(
                    (Number(downloaded) / total) * 100,
                  );

                  // OPTIMIZATION: Only trigger React state if percentage actually changed
                  if (percentage > lastPercentageRef.current) {
                    lastPercentageRef.current = percentage;
                    setDownloadProgress({
                      totalBytes: total,
                      downloadedBytes: downloaded ?? 0,
                      percentage,
                    });
                  }
                }
              } else if (event.status === "failed") {
                setError(event.error ?? "Error");
                setIsDownloading(false);
              }
            },
          );

          // Trigger Native Download
          console.log("Run1");
          await Proofreader.downloadFeature();
          console.log("Run2");

          // Cleanup states once Promise resolves
          if (isMounted) {
            setStatus("AVAILABLE");
            setIsReady(true);
            setIsDownloading(false);
            setDownloadProgress((prev) => ({ ...prev, percentage: 100 }));
          }
        } else if (currentStatus === "AVAILABLE") {
          if (isMounted) {
            setIsReady(true);
            setDownloadProgress({
              totalBytes: 1,
              downloadedBytes: 1,
              percentage: 100,
            });
          }
        } else if (currentStatus === "UNAVAILABLE") {
          if (isMounted)
            setError(
              "Device lacks hardware support for ML Kit GenAI Proofreading.",
            );
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsDownloading(false);
        }
      }
    }

    initClient();

    return () => {
      isMounted = false;
      // 5. Clean up the listener to prevent memory leaks
      if (progressSubscription) {
        progressSubscription.remove();
      }
    };
  }, [inputType, language]);

  const proofread = useCallback(
    async (text: string) => {
      if (!isReady)
        throw new Error("GenAI Model is not ready or still downloading.");
      return await Proofreader.proofread(text);
    },
    [isReady],
  );

  return {
    status,
    isReady,
    isDownloading,
    downloadProgress, // Export the progress metrics
    error,
    proofread,
  };
};

export { useProofReader };
