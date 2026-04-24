package expo.modules.genaiproofreading

import com.google.mlkit.genai.proofreading.Proofreader
import com.google.mlkit.genai.proofreading.ProofreaderOptions
import com.google.mlkit.genai.proofreading.Proofreading
import com.google.mlkit.genai.common.DownloadCallback
import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.common.GenAiException
import com.google.mlkit.genai.proofreading.ProofreadingRequest
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.guava.await
import kotlin.collections.mapOf

class ExpoGenaiProofreadingModule : Module() {
    private var proofreader: Proofreader? = null
    private val ioScope = CoroutineScope(Dispatchers.IO)

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {


        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoGenaiProofreading')` in JavaScript.
        Name("ExpoGenaiProofreading")

        Events("onDownloadProgress")

        OnDestroy {
            proofreader?.close()
            proofreader = null
            ioScope.cancel()
        }

        AsyncFunction("initialize") { inputTypeStr: String, languageStr: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")

            val inputType = if (inputTypeStr == "VOICE") {
                ProofreaderOptions.InputType.VOICE
            } else {
                ProofreaderOptions.InputType.KEYBOARD
            }

            val language = when (languageStr) {
                "JAPANESE" -> ProofreaderOptions.Language.JAPANESE
                "SPANISH" -> ProofreaderOptions.Language.SPANISH
                "FRENCH" -> ProofreaderOptions.Language.FRENCH
                "GERMAN" -> ProofreaderOptions.Language.GERMAN
                "ITALIAN" -> ProofreaderOptions.Language.ITALIAN
                "KOREAN" -> ProofreaderOptions.Language.KOREAN
                else -> ProofreaderOptions.Language.ENGLISH
            }

            val options = ProofreaderOptions.builder(context)
                .setInputType(inputType)
                .setLanguage(language)
                .build()

            proofreader?.close()
            proofreader = Proofreading.getClient(options)
            return@AsyncFunction true
        }

        AsyncFunction("checkFeatureStatus") { promise: Promise ->
            val pr = proofreader ?: run {
                promise.reject("ERR_NOT_INIT", "Proofreader not initialized.", null)
                return@AsyncFunction
            }

            ioScope.launch {
                try {
                    val statusInt = pr.checkFeatureStatus().await()

                    val statusStr = when (statusInt) {
                        FeatureStatus.AVAILABLE -> "AVAILABLE"       // 3
                        FeatureStatus.DOWNLOADABLE -> "DOWNLOADABLE" // 1
                        FeatureStatus.DOWNLOADING -> "DOWNLOADING"   // 2
                        FeatureStatus.UNAVAILABLE -> "UNAVAILABLE"   // 0
                        else -> "UNAVAILABLE"
                    }
                    promise.resolve(statusStr)
                } catch (e: Exception) {
                    promise.reject("ERR_STATUS", e.message, e)
                }
            }
        }

        AsyncFunction("downloadFeature") { promise: Promise ->
            val pr = proofreader ?: run {
                print(proofreader)
                promise.reject("ERR_NOT_INIT", "Proofreader not initialized.", null)
                return@AsyncFunction
            }

            pr.downloadFeature(object : DownloadCallback {
                override fun onDownloadStarted(bytesToDownload: Long) {

                    this@ExpoGenaiProofreadingModule.sendEvent(
                        "onDownloadProgress",
                        mapOf(
                            "status" to "started",
                            "bytesToDownload" to bytesToDownload.toDouble(),
                            "totalBytesDownloaded" to 0L
                        )
                    )
                }

                override fun onDownloadProgress(totalBytesDownloaded: Long) {

                    this@ExpoGenaiProofreadingModule.sendEvent(
                        "onDownloadProgress", mapOf(
                            "status" to "progress",
                            "totalBytesDownloaded" to totalBytesDownloaded.toDouble()
                        )
                    )
                }

                override fun onDownloadFailed(e: GenAiException) {
                    promise.reject("ERR_DOWNLOAD", e.message, e)
                }

                override fun onDownloadCompleted() {
                    this@ExpoGenaiProofreadingModule.sendEvent(
                        "onDownloadProgress", mapOf(
                            "status" to "completed"
                        )
                    )
                    promise.resolve(true)
                }
            })
        }

        AsyncFunction("proofread") { text: String, promise: Promise ->
            val pr = proofreader ?: run {
                promise.reject("ERR_NOT_INIT", "Proofreader not initialized.", null)
                return@AsyncFunction
            }

            ioScope.launch {
                try {
                    val request = ProofreadingRequest.builder(text).build()
                    val results = pr.runInference(request).await().results

                    val mappedResults = results.map {
                        mapOf("text" to it.text)
                    }
                    promise.resolve(mappedResults)
                } catch (e: Exception) {
                    promise.reject("ERR_PROOFREAD", e.message ?: "Unknown inference error", e)
                }
            }
        }

        AsyncFunction("close") {
            proofreader?.close()
            proofreader = null
        }


        Constant("package_name") {
            "expo-genai-proofreading"
        }

    }
}
