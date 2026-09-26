import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface AegisLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  iconOnly?: boolean;
  onPress?: () => void;
}

export function AegisShieldIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

export function AegisLogo({
  size = 'md',
  showSubtitle = true,
  iconOnly = false,
  onPress,
}: AegisLogoProps) {
  const colors = useColors();

  const iconSizes = {
    sm: 26,
    md: 34,
    lg: 44,
  };

  const titleSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  };

  const subSizes = {
    sm: 7.5,
    md: 8.5,
    lg: 10,
  };

  const content = (
    <View style={styles.container}>
      <AegisShieldIcon size={iconSizes[size]} />
      {!iconOnly && (
        <View style={styles.textContainer}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandText, { color: colors.foreground, fontSize: titleSizes[size] }]}>
              AEGIS
            </Text>
            <Text style={[styles.brandText, { color: '#0284C7', fontSize: titleSizes[size], marginLeft: 5 }]}>
              ALERT
            </Text>
          </View>
          {showSubtitle && (
            <Text style={[styles.subtitleText, { color: colors.muted, fontSize: subSizes[size] }]}>
              HAZARD & WEATHER INTELLIGENCE
            </Text>
          )}
        </div>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default AegisLogo;
