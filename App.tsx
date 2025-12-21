import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Config from 'react-native-config';


const App = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Hello, World!</Text>
         <Text>Environment: {Config.ENV}</Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
