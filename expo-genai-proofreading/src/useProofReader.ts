import { useCallback, useEffect, useState } from "react";
import { FeatureStatus, InputType, Language } from "./ExpoGenaiProofreading.types";
import { Platform } from "react-native";
import Proofreader from './ExpoGenaiProofreadingModule'

const useProofReader = ({ inputType = 'KEYBOARD', language = 'ENGLISH' }: { language: Language, inputType: InputType }) => {
    const [status, setStatus] = useState<FeatureStatus | 'UNINITIALIZED'>('UNINITIALIZED');
    const [isReady, setIsReady] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function initClient() {
            if (Platform.OS !== 'android') {
                if (isMounted) setError('Proofreading is currently an Android-only feature.');
                return;
            }

            try {
                // 1. Initialize Native ML Kit Client
                await Proofreader.initialize(inputType, language);

                // 2. Check Device Hardware/Model Status
                const currentStatus = await Proofreader.checkFeatureStatus();
                if (isMounted) setStatus(currentStatus);

                // 3. Auto-download Gemini Nano Model if needed
                if (currentStatus === 'DOWNLOADABLE' || currentStatus === 'DOWNLOADING') {
                    if (isMounted) setIsDownloading(true);

                    await Proofreader.downloadFeature();

                    if (isMounted) {
                        setStatus("AVAILABLE");
                        setIsReady(true);
                        setIsDownloading(false);
                    }
                } else if (currentStatus === 'AVAILABLE') {
                    if (isMounted) setIsReady(true);
                } else if (currentStatus === 'UNAVAILABLE') {
                    if (isMounted) setError('Device lacks hardware support for ML Kit GenAI Proofreading.');
                }

            } catch (err) {
                if (isMounted) setError(err instanceof Error ? err.message : String(err));
            }
        }

        initClient();

        return () => {
            isMounted = false;
        };
    }, [inputType, language]);

    const proofread = useCallback(async (text: string) => {
        if (!isReady) throw new Error("GenAI Model is not ready or still downloading.");
        return await Proofreader.proofread(text);
    }, [isReady]);


    return {
        status,
        isReady,
        isDownloading,
        error,
        proofread
    }
}

export {
    useProofReader
}