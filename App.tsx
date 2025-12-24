import { Text, View } from "react-native";
import Config from 'react-native-config';
import { SafeAreaView } from "react-native-safe-area-context";


const App = () => {
  return (
     <SafeAreaView style={{ flex: 1,backgroundColor: 'white' }}>
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> 
        <Text>Hello, World! demo</Text>
         <Text>Environment: {Config.APP_ENV}</Text>
      </View>
     </SafeAreaView>
  );
};

export default App;
