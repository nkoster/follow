import {useEffect, useState} from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, {Marker, Polyline} from 'react-native-maps'

export default function App() {
  const [location, setLocation] = useState(null);
  const [polyline, setPolyline] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      if (location) setLocation(location);
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        newLocation => {
          setLocation(newLocation)
          setPolyline(prev => prev.concat({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude
          }))
        }
      );
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(polyline);
  }

  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      {location ?
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.coords.latitude : 0,
          longitude: location ? location.coords.longitude : 0,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        annotations={[{
          latitude: location ? location.coords.latitude : 0,
          longitude: location ? location.coords.longitude : 0,
          title: 'You are here',
          subtitle: 'This is your current location'
        }]}
      >
        <Marker
          coordinate={{
            latitude: location ? location.coords.latitude : 0,
            longitude: location ? location.coords.longitude : 0,
          }}
          title="You are here"
          description="This is your current location"
        />
        {polyline.length > 2 ? <Polyline
          coordinates={polyline}
          strokeWidth={2}
          strokeColor="red"
        /> : null}
      </MapView> : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '80%',
  },
});
