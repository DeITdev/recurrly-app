import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const isBusy = fetchStatus === "fetching";
  const canSubmit = emailAddress.trim().length > 0 && password.length > 0 && !isBusy;

  const navigateAfterFinalize = (params: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (path: string) => string;
  }) => {
    if (params.session?.currentTask) {
      console.log(params.session?.currentTask);
      return;
    }
    const url = params.decorateUrl("/");
    router.replace(url as Href);
  };

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: navigateAfterFinalize,
      });
    } else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code"
      );
      if (emailCodeFactor) {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) {
          console.error(JSON.stringify(error, null, 2));
        }
      }
    }
  };

  const handleVerify = async () => {
    try {
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: navigateAfterFinalize,
        });
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  /* ─── Verification step ─── */
  if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
    return (
      <View className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {/* Brand */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>

              <Text className="auth-title">Verify your account</Text>
              <Text className="auth-subtitle">
                We sent a verification code to your email
              </Text>
            </View>

            {/* Card */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${
                      errors.fields.code ? "auth-input-error" : ""
                    }`}
                    style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    autoFocus
                  />
                  {errors.fields.code && (
                    <Text className="auth-error">
                      {errors.fields.code.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${
                    (!code || isBusy) ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleVerify}
                  disabled={!code || isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={async () => {
                    const { error } = await signIn.mfa.sendEmailCode();
                    if (error) {
                      console.error(JSON.stringify(error, null, 2));
                    }
                  }}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.reset()}
                >
                  <Text className="auth-secondary-button-text">
                    Start over
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  /* ─── Main sign-in form ─── */
  return (
    <View className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Brand */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          {/* Card */}
          <View className="auth-card">
            <View className="auth-form">
              {/* Email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${
                    errors.fields.identifier ? "auth-input-error" : ""
                  }`}
                  style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  onChangeText={setEmailAddress}
                  editable={!isBusy}
                />
                {errors.fields.identifier && (
                  <Text className="auth-error">
                    {errors.fields.identifier.message}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={`auth-input ${
                    errors.fields.password ? "auth-input-error" : ""
                  }`}
                  style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                  secureTextEntry
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  onChangeText={setPassword}
                  editable={!isBusy}
                />
                {errors.fields.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                className={`auth-button ${
                  !canSubmit ? "auth-button-disabled" : ""
                }`}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {isBusy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Footer link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurrly? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}