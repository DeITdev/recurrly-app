import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "User";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-5">Settings</Text>

      {/* Profile section */}
      <View className="rounded-2xl border border-border bg-card p-5 gap-4">
        <View className="flex-row items-center gap-3">
          <Image
            source={
              user?.imageUrl
                ? { uri: user.imageUrl }
                : require("@/assets/images/avatar.png")
            }
            className="size-14 rounded-full"
          />
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-primary">
              {displayName}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign out */}
      <Pressable
        className="sub-cancel mt-5"
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        <Text className="sub-cancel-text">
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}