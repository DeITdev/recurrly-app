import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const SubscriptionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  )
}

export default SubscriptionDetail