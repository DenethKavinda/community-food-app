import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import API from "../../services/api";

/* -------------------------------------------------------------------------- */
/*  Design tokens (Matching Login)                                            */
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
/*  Animation Helpers & Background                                            */
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
          name="account-plus"
          size={38}
          color={COLORS.ink}
        />
      </LinearGradient>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Custom Glass Input Component                                              */
/* -------------------------------------------------------------------------- */

const GlassInput = React.forwardRef(function GlassInput(
  { icon, iconFamily = "Ionicons", right, hasError, onFocus, onBlur, ...props },
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
      {iconFamily === "FontAwesome5" ? (
        <FontAwesome5
          name={icon}
          size={18}
          color={focused ? COLORS.accent : COLORS.muted}
          style={styles.inputIcon}
        />
      ) : (
        <Ionicons
          name={icon}
          size={20}
          color={focused ? COLORS.accent : COLORS.muted}
          style={styles.inputIcon}
        />
      )}
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
/*  Primary Button Component                                                  */
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
/*  Main Screen                                                               */
/* -------------------------------------------------------------------------- */

const ROLES = [
  { key: "DONOR", label: "Donor", icon: "heart-outline" },
  { key: "RECIPIENT", label: "Recipient", icon: "people-outline" },
  { key: "FOOD_BANK", label: "Food Bank", icon: "storefront-outline" },
  { key: "DRIVER", label: "Driver", icon: "car-outline" },
];

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("DONOR");

  // Input states
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Dynamic states
  const [businessName, setBusinessName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for sequential focus
  const nicRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const dynamicRef1 = useRef(null);
  const dynamicRef2 = useRef(null);
  const dynamicRef3 = useRef(null);

  // Animations
  const cardIn = useRef(new Animated.Value(0)).current;
  const items = useRef(
    Array.from({ length: 9 }).map(() => new Animated.Value(0)),
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
          60,
          items.map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 400,
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

  const handleRegister = async () => {
    if (loading) return;
    Keyboard.dismiss();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedNic = nic.trim();

    if (!trimmedName || !trimmedNic || !trimmedEmail || !password) {
      return fail("Please fill in all required fields marked with *");
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return fail("That email address isn't valid. Check it and try again.");
    }

    setError("");
    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        nic: trimmedNic,
        email: trimmedEmail,
        password,
        role,
        phone,
        address,
        business_name: businessName,
        organization_name: orgName,
        register_number: regNumber,
        license_number: licenseNumber,
      };

      const response = await API.post("/auth/register", payload);

      if (response.data?.requiresApproval) {
        alert(
          "Registration Submitted: Your account was created and is currently pending Admin approval.",
        );
      }
      router.replace("/(auth)/login");
    } catch (err) {
      fail(
        err?.response?.data?.message ||
          "Registration failed. Please review your information and try again.",
      );
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.title}>Join NourishShare</Text>
              <Text style={styles.subtitle}>
                Create an account to start sharing or receiving surplus food.
              </Text>
            </Animated.View>

            {error ? <ErrorBanner message={error} /> : null}

            {/* Account Type Selector */}
            <Animated.View style={rise(items[1])}>
              <Text style={styles.roleLabel}>Select Account Type:</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((item) => {
                  const isActive = role === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.roleCard,
                        isActive && styles.roleCardActive,
                      ]}
                      onPress={() => setRole(item.key)}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={isActive ? COLORS.ink : COLORS.accentSoft}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          isActive && styles.roleTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* Name */}
            <Animated.View style={rise(items[2])}>
              <GlassInput
                icon="person-outline"
                placeholder="Full Name *"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  if (error) setError("");
                }}
                hasError={!!error && !name.trim()}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => nicRef.current?.focus()}
              />
            </Animated.View>

            {/* NIC */}
            <Animated.View style={rise(items[3])}>
              <GlassInput
                ref={nicRef}
                icon="card-outline"
                placeholder="NIC Number *"
                value={nic}
                onChangeText={(v) => {
                  setNic(v);
                  if (error) setError("");
                }}
                hasError={!!error && !nic.trim()}
                autoCapitalize="characters"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </Animated.View>

            {/* Email */}
            <Animated.View style={rise(items[4])}>
              <GlassInput
                ref={emailRef}
                icon="mail-outline"
                placeholder="Email Address *"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError("");
                }}
                hasError={!!error && (!email.trim() || !EMAIL_RE.test(email))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </Animated.View>

            {/* Password */}
            <Animated.View style={rise(items[5])}>
              <GlassInput
                ref={passwordRef}
                icon="lock-closed-outline"
                placeholder="Password *"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (error) setError("");
                }}
                hasError={!!error && !password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => phoneRef.current?.focus()}
                right={
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    hitSlop={10}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.muted}
                    />
                  </Pressable>
                }
              />
            </Animated.View>

            {/* Phone */}
            <Animated.View style={rise(items[6])}>
              <GlassInput
                ref={phoneRef}
                icon="call-outline"
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => dynamicRef1.current?.focus()}
              />
            </Animated.View>

            {/* Role Dynamic Inputs */}
            <Animated.View style={rise(items[7])}>
              {role === "DONOR" && (
                <GlassInput
                  ref={dynamicRef1}
                  icon="business-outline"
                  placeholder="Business Name (Optional)"
                  value={businessName}
                  onChangeText={setBusinessName}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              )}

              {role === "RECIPIENT" && (
                <GlassInput
                  ref={dynamicRef1}
                  icon="location-outline"
                  placeholder="Delivery Address / Location *"
                  value={address}
                  onChangeText={setAddress}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              )}

              {role === "FOOD_BANK" && (
                <>
                  <GlassInput
                    ref={dynamicRef1}
                    icon="business-outline"
                    placeholder="Food Bank Name *"
                    value={orgName}
                    onChangeText={setOrgName}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => dynamicRef2.current?.focus()}
                  />
                  <GlassInput
                    ref={dynamicRef2}
                    icon="document-text-outline"
                    placeholder="Registration Number *"
                    value={regNumber}
                    onChangeText={setRegNumber}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => dynamicRef3.current?.focus()}
                  />
                  <GlassInput
                    ref={dynamicRef3}
                    icon="location-outline"
                    placeholder="Organization Address *"
                    value={address}
                    onChangeText={setAddress}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </>
              )}

              {role === "DRIVER" && (
                <>
                  <GlassInput
                    ref={dynamicRef1}
                    icon="id-card"
                    iconFamily="FontAwesome5"
                    placeholder="Driving License Number *"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => dynamicRef2.current?.focus()}
                  />
                  <GlassInput
                    ref={dynamicRef2}
                    icon="location-outline"
                    placeholder="Operating Base Address *"
                    value={address}
                    onChangeText={setAddress}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </>
              )}
            </Animated.View>

            {/* Submit */}
            <Animated.View style={rise(items[8])}>
              <PrimaryButton
                label="Create Account"
                loading={loading}
                onPress={handleRegister}
              />
            </Animated.View>

            {/* Sign in redirect */}
            <Animated.View style={rise(items[8])}>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                style={styles.loginLink}
                hitSlop={8}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginHighlight}>Log in</Text>
                </Text>
              </Pressable>
            </Animated.View>
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
    paddingVertical: 40,
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
    marginBottom: 20,
  },
  logoWrap: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
    marginTop: 6,
    paddingHorizontal: 8,
  },

  /* Role Selection */
  roleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 10,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  roleCard: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: COLORS.fieldBg,
    borderWidth: 1.5,
    borderColor: COLORS.fieldBorder,
  },
  roleCardActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accentSoft,
  },
  roleTextActive: {
    color: COLORS.ink,
  },

  /* Inputs */
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: "100%",
  },
  eyeBtn: { padding: 4 },

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
    marginTop: 6,
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

  /* Sign in Link */
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  loginHighlight: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
