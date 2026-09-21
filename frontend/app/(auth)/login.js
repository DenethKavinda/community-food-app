import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  AccessibilityInfo,
  useWindowDimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

/* -------------------------------------------------------------------------- */
/*  Design Tokens                                                             */
/* -------------------------------------------------------------------------- */

const COLORS = {
  bgTop: "#052e16",
  bgMid: "#14532d",
  bgBottom: "#0f766e",
  accent: "#4ade80",
  accentDeep: "#16a34a",
  accentSoft: "#bbf7d0",
  ink: "#052e16",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  placeholder: "rgba(255,255,255,0.45)",
  glass: "rgba(255,255,255,0.09)",
  glassBorder: "rgba(255,255,255,0.22)",
  fieldBorder: "rgba(255,255,255,0.18)",
  fieldBg: "rgba(255,255,255,0.08)",
  fieldBgFocus: "rgba(255,255,255,0.16)",
  danger: "#fca5a5",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/*  Animation Helpers                                                         */
/* -------------------------------------------------------------------------- */

function useLoop({ duration, delay = 0, reverse = true }) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let anim;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled || reduce) return;

        const step = (toValue) =>
          Animated.timing(value, {
            toValue,
            duration,
            easing: reverse ? Easing.inOut(Easing.sin) : Easing.linear,
            useNativeDriver: true,
          });

        const cycle = reverse ? Animated.sequence([step(1), step(0)]) : step(1);

        anim = Animated.sequence([Animated.delay(delay), Animated.loop(cycle)]);
        anim.start();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (anim) anim.stop();
    };
  }, [value, duration, delay, reverse]);

  return value;
}

function Blob({ size, colors, style, duration, delay = 0, dx, dy }) {
  const t = useLoop({ duration, delay });
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dx],
  });
  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dy],
  });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          transform: [{ translateX }, { translateY }, { scale }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const PARTICLES = [
  { icon: "food-apple", x: 0.06, size: 28, duration: 15000, delay: 0 },
  { icon: "bread-slice", x: 0.24, size: 24, duration: 18000, delay: 3500 },
  { icon: "carrot", x: 0.42, size: 26, duration: 16000, delay: 7000 },
  { icon: "fruit-grapes", x: 0.6, size: 30, duration: 19000, delay: 1500 },
  { icon: "cheese", x: 0.78, size: 24, duration: 14000, delay: 5000 },
  { icon: "food-croissant", x: 0.9, size: 28, duration: 17000, delay: 9000 },
  { icon: "heart", x: 0.14, size: 20, duration: 13000, delay: 10500 },
  { icon: "corn", x: 0.52, size: 22, duration: 20000, delay: 12000 },
  { icon: "fish", x: 0.7, size: 22, duration: 16500, delay: 2500 },
];

function FloatingIcon({ icon, x, size, duration, delay, width, height }) {
  const t = useLoop({ duration, delay, reverse: false });

  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 40, -80],
  });
  const translateX = t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 16, 0, -16, 0],
  });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "25deg"],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, 0.32, 0.32, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: x * width,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={size}
        color={COLORS.accentSoft}
      />
    </Animated.View>
  );
}

function Background() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgMid, COLORS.bgBottom]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Blob
        size={320}
        colors={["#22c55e", "#15803d"]}
        style={{ top: -90, left: -100, opacity: 0.38 }}
        duration={7000}
        dx={40}
        dy={50}
      />
      <Blob
        size={380}
        colors={["#2dd4bf", "#0d9488"]}
        style={{ bottom: -130, right: -140, opacity: 0.32 }}
        duration={9000}
        dx={-50}
        dy={-40}
        delay={800}
      />
      <Blob
        size={200}
        colors={["#a3e635", "#65a30d"]}
        style={{ top: "38%", right: -70, opacity: 0.2 }}
        duration={6000}
        dx={-30}
        dy={40}
        delay={400}
      />

      {PARTICLES.map((p) => (
        <FloatingIcon key={p.icon} {...p} width={width} height={height} />
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Logo Component                                                            */
/* -------------------------------------------------------------------------- */

function Logo() {
  const ring1 = useLoop({ duration: 2600, reverse: false });
  const ring2 = useLoop({ duration: 2600, reverse: false, delay: 1300 });
  const bob = useLoop({ duration: 2600 });

  const ringStyle = (v) => ({
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) },
    ],
  });

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.View
      style={[styles.logoWrap, { transform: [{ translateY: bobY }] }]}
    >
      <Animated.View style={[styles.logoRing, ringStyle(ring1)]} />
      <Animated.View style={[styles.logoRing, ringStyle(ring2)]} />
      <LinearGradient
        colors={[COLORS.accentSoft, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoCircle}
      >
        <MaterialCommunityIcons
          name="hand-heart"
          size={38}
          color={COLORS.ink}
        />
      </LinearGradient>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glass Input Component                                                     */
/* -------------------------------------------------------------------------- */

const GlassInput = React.forwardRef(function GlassInput(
  { icon, right, hasError, onFocus, onBlur, ...props },
  ref,
) {
  const focus = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const animate = (toValue) =>
    Animated.timing(focus, {
      toValue,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

  const borderColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.fieldBorder, COLORS.accent],
  });
  const backgroundColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.fieldBg, COLORS.fieldBgFocus],
  });

  return (
    <Animated.View
      style={[
        styles.inputWrap,
        {
          backgroundColor,
          borderColor: hasError ? COLORS.danger : borderColor,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={focused ? COLORS.accent : COLORS.muted}
        style={styles.inputIcon}
      />
      <TextInput
        ref={ref}
        style={styles.input}
        placeholderTextColor={COLORS.placeholder}
        selectionColor={COLORS.accent}
        onFocus={(e) => {
          setFocused(true);
          animate(1);
          onFocus && onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          animate(0);
          onBlur && onBlur(e);
        }}
        {...props}
      />
      {right}
    </Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/*  Primary Button                                                            */
/* -------------------------------------------------------------------------- */

function PrimaryButton({ label, loading, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [width, setWidth] = useState(0);

  const shimmer = useLoop({ duration: 2800, reverse: false, delay: 900 });
  const nudge = useLoop({ duration: 700 });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [-100, width + 100, width + 100],
  });
  const arrowX = nudge.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  const spring = (toValue) =>
    Animated.spring(scale, {
      toValue,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={[styles.btnShadow, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        disabled={loading}
        onPressIn={() => spring(0.96)}
        onPressOut={() => spring(1)}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <LinearGradient
          colors={["#86efac", COLORS.accent, "#22c55e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {!loading && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerX }, { skewX: "-20deg" }] },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.6)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {loading ? (
          <ActivityIndicator color={COLORS.ink} />
        ) : (
          <View style={styles.btnContent}>
            <Text style={styles.btnText}>{label}</Text>
            <Animated.View style={{ transform: [{ translateX: arrowX }] }}>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={COLORS.ink}
                style={{ marginLeft: 8 }}
              />
            </Animated.View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Error Banner                                                              */
/* -------------------------------------------------------------------------- */

function ErrorBanner({ message }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    a.setValue(0);
    Animated.spring(a, {
      toValue: 1,
      speed: 16,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [message, a]);

  return (
    <Animated.View
      style={[
        styles.errorBox,
        {
          opacity: a.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: a.interpolate({
                inputRange: [0, 1],
                outputRange: [-8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name="alert-circle" size={18} color="#fecaca" />
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Login Screen                                                         */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  { icon: "food-apple-outline", label: "Donate surplus" },
  { icon: "magnify", label: "Find meals" },
  { icon: "recycle", label: "Reduce waste" },
];

export default function Login() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRef = useRef(null);

  // Entrance animations
  const cardIn = useRef(new Animated.Value(0)).current;
  const items = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0)),
  ).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(cardIn, {
        toValue: 1,
        speed: 9,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(220),
        Animated.stagger(
          90,
          items.map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 480,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [cardIn, items]);

  const rise = (v) => ({
    opacity: v,
    transform: [
      {
        translateY: v.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }),
      },
    ],
  });

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fail = (message) => {
    setError(message);
    runShake();
  };

  const handleLogin = async () => {
    if (loading) return;
    Keyboard.dismiss();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      return fail("Enter your email and password to continue.");
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return fail("That email address isn't valid. Check it and try again.");
    }

    setError("");
    setLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (err) {
      fail(
        err?.response?.data?.message ||
          "Email or password is incorrect. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset password",
      "Password reset isn't available yet. Please contact support.",
    );
  };

  const cardStyle = {
    opacity: cardIn.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: cardIn.interpolate({
          inputRange: [0, 1],
          outputRange: [60, 0],
        }),
      },
      {
        scale: cardIn.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
      {
        translateX: shake.interpolate({
          inputRange: [-1, 1],
          outputRange: [-10, 10],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Background />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Glass sheen */}
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.02)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <Animated.View style={[styles.header, rise(items[0])]}>
              <Logo />
              <Text style={styles.title}>NourishShare</Text>
              <Text style={styles.subtitle}>
                Share surplus food with the people who need it.
              </Text>
            </Animated.View>

            {error ? <ErrorBanner message={error} /> : null}

            {/* Email */}
            <Animated.View style={rise(items[1])}>
              <GlassInput
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError("");
                }}
                hasError={!!error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </Animated.View>

            {/* Password */}
            <Animated.View style={rise(items[2])}>
              <GlassInput
                ref={passwordRef}
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (error) setError("");
                }}
                hasError={!!error}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                right={
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    hitSlop={10}
                    style={styles.eyeBtn}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.muted}
                    />
                  </Pressable>
                }
              />
              <Pressable
                onPress={handleForgotPassword}
                hitSlop={8}
                style={styles.forgot}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </Animated.View>

            {/* Submit */}
            <Animated.View style={rise(items[3])}>
              <PrimaryButton
                label="Log in"
                loading={loading}
                onPress={handleLogin}
              />
            </Animated.View>

            {/* Sign up Link */}
            <Animated.View style={rise(items[4])}>
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                style={styles.signup}
                hitSlop={8}
              >
                <Text style={styles.signupText}>
                  New to NourishShare?{" "}
                  <Text style={styles.signupHighlight}>Create an account</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Feature chips */}
          <Animated.View style={[styles.chips, rise(items[4])]}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.chip}>
                <MaterialCommunityIcons
                  name={f.icon}
                  size={15}
                  color={COLORS.accentSoft}
                />
                <Text style={styles.chipText}>{f.label}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTop,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 24,
    overflow: "hidden",
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 26,
  },
  logoWrap: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
    marginTop: 8,
    paddingHorizontal: 12,
  },

  /* Inputs */
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: "100%",
  },
  eyeBtn: { padding: 4 },

  forgot: {
    alignSelf: "flex-end",
    marginBottom: 18,
    marginTop: -2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accentSoft,
  },

  /* Error */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.16)",
    borderWidth: 1,
    borderColor: "rgba(252,165,165,0.45)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#fee2e2",
  },

  /* Button */
  btnShadow: {
    borderRadius: 16,
    backgroundColor: "#22c55e",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnText: {
    color: COLORS.ink,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 70,
  },

  /* Sign up */
  signup: {
    marginTop: 22,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  signupHighlight: {
    color: COLORS.accent,
    fontWeight: "700",
  },

  /* Feature chips */
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accentSoft,
  },
});
