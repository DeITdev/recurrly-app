import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const isBusy = fetchStatus === "fetching";
  const canSubmit =
    emailAddress.trim().length > 0 && password.length >= 8 && !isBusy;

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as Href);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  /* ─── Email verification step ─── */
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
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

              <Text className="auth-title">Verify your email</Text>
              <Text className="auth-subtitle">
                We sent a 6-digit code to {emailAddress}
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
                    <Text className="auth-button-text">Verify & continue</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  /* ─── Main sign-up form ─── */
  return (
    <View className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" :undefined}
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

            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking your subscriptions today
            </Text>
          </View>

          {/* Card */}
          <View className="auth-card">
            <View className="auth-form">
              {/* Name row */}
              <View className="flex-row gap-3">
                <View className="auth-field flex-1">
                  <Text className="auth-label">First name</Text>
<TextInput
                    className="auth-input"
                    style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                    value={firstName}
                    placeholder="John"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    editable={!isBusy}
                  />
                </View>
                <View className="auth-field flex-1">
                  <Text className="auth-label">Last name</Text>
                  <TextInput
                    className="auth-input"
                    style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                    value={lastName}
                    placeholder="Doe"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    editable={!isBusy}
                  />
                </View>
              </View>

              {/* Email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${
                    errors.fields.emailAddress ? "auth-input-error" : ""
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
                {errors.fields.emailAddress && (
                  <Text className="auth-error">
                    {errors.fields.emailAddress.message}
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
                  placeholder="At least 8 characters"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  onChangeText={setPassword}
                  editable={!isBusy}
                />
                {errors.fields.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
                {!errors.fields.password && password.length > 0 && password.length < 8 && (
                  <Text className="auth-helper">
                    Password must be at least 8 characters
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
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Captcha container (required for Clerk bot protection) */}
          <View nativeID="clerk-captcha" />

          {/* Footer link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}