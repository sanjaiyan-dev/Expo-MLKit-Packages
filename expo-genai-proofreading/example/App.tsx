import { useProofReader } from 'expo-genai-proofreading';
import { useState } from 'react';
import { Button, SafeAreaView, Text, View, StyleSheet, TextInput } from 'react-native';

export default function App() {
  const { proofread, status,downloadProgress } = useProofReader({ inputType: 'KEYBOARD', language: "ENGLISH" }) 
  const [txt, setTxt] = useState('')
  const [result, setResult] = useState<any>([])

  console.log(result);
  console.log(status);
  console.log(downloadProgress)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>MLKit GenAI ProofReading Example</Text>
      </View>
      <View style={styles.content}>
        <TextInput onChangeText={(t) => setTxt(t)} placeholder='Proofread text....' />
        <Button title="Proof  Read" onPress={async () => {
          setResult(await proofread(txt))
        }} />
        <Text style={{color: '#000'}}>{JSON.stringify(downloadProgress)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eee',
    flex: 1,
    textAlign: 'center',
    color: '#000'
  },
  header: {
    textAlign: 'justify',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'monospace',
    marginTop: 21,
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    margin: 5
  },
  heading: {
    fontSize: 20,
    fontFamily: 'monospace',
    textDecorationStyle: 'dotted',
  },
  content: {
    backgroundColor: '#f6f9ff',
    borderRadius: 12,
    margin: 5
  },

})
