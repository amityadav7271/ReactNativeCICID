import { Text, View } from "react-native";
import Config from 'react-native-config';


const App = () => {
  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> 
        <Text>Hello, World!</Text>
         <Text>Environment: {Config.ENV}</Text>
      </View>
  );
};

export default App;
