import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Plus, X, Search, CornerDownLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Option {
  id: string;
  name: string;
}

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Debounced autocomplete search. */
  search: (q: string) => Promise<Option[]>;
  /** Find-or-create an entry; returns the canonical name to store. */
  createEntry: (name: string) => Promise<{ name: string }>;
  hint?: string;
}

const MIN_CHARS = 1;

export const ChipAutocompleteField: React.FC<Props> = ({
  label,
  values,
  onChange,
  placeholder,
  search,
  createEntry,
  hint,
}) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [focused, setFocused] = useState(false);
  const reqId = useRef(0);

  const lc = (s: string) => s.trim().toLowerCase();
  const has = (name: string) => values.some(v => lc(v) === lc(name));

  const trimmed = query.trim();

  // Only search once the member starts typing.
  useEffect(() => {
    if (trimmed.length < MIN_CHARS) {
      reqId.current++; // cancel any in-flight result
      setOptions([]);
      setLoading(false);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await search(trimmed);
        if (reqId.current === id) setOptions(res);
      } catch {
        if (reqId.current === id) setOptions([]);
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  const addValue = (name: string) => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean && !has(clean)) onChange([...values, clean]);
    setQuery('');
    setOptions([]);
    setLoading(false);
  };

  const addTyped = async () => {
    if (!trimmed || adding) return;
    const exact = options.find(o => lc(o.name) === lc(trimmed));
    if (exact) return addValue(exact.name);
    setAdding(true);
    try {
      const res = await createEntry(trimmed);
      addValue(res.name);
    } catch {
      addValue(trimmed); // fall back to the raw text so the member isn't blocked
    } finally {
      setAdding(false);
    }
  };

  const visibleOptions = options.filter(o => !has(o.name));
  const exactExists = options.some(o => lc(o.name) === lc(trimmed));
  const showCreateRow = trimmed.length >= 2 && !exactExists && !has(trimmed);
  const showDropdown = focused && trimmed.length >= MIN_CHARS;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputRow}>
        <View style={styles.inputBox}>
          <Search color={colors.textMuted} size={15} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={t => {
              if (t.endsWith(',')) {
                setQuery(t.slice(0, -1));
                addTyped();
              } else {
                setQuery(t);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onSubmitEditing={addTyped}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            autoCapitalize="words"
          />
          {(loading || adding) && <ActivityIndicator size="small" color={colors.textMuted} />}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addTyped} disabled={!trimmed}>
          <Plus color={colors.white} size={16} />
        </TouchableOpacity>
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {loading && visibleOptions.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.textMuted} />
              <Text style={styles.loadingText}>Searching…</Text>
            </View>
          ) : (
            <>
              {visibleOptions.length > 0 && (
                <ScrollView
                  style={styles.optionsScroll}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {visibleOptions.map(o => (
                    <TouchableOpacity
                      key={o.id}
                      style={styles.optionRow}
                      onPress={() => addValue(o.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionText}>{o.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {showCreateRow && (
                <TouchableOpacity style={styles.createRow} onPress={addTyped} activeOpacity={0.7}>
                  <CornerDownLeft color={colors.crimson} size={13} />
                  <Text style={styles.createText}>Add “{trimmed}” as a new industry</Text>
                </TouchableOpacity>
              )}
              {!loading && visibleOptions.length === 0 && !showCreateRow && (
                <Text style={styles.emptyText}>No matches</Text>
              )}
            </>
          )}
        </View>
      )}

      {values.length > 0 && (
        <View style={styles.chipWrap}>
          {values.map(v => (
            <TouchableOpacity
              key={v}
              style={styles.chip}
              onPress={() => onChange(values.filter(x => x !== v))}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{v}</Text>
              <X color={colors.textSecondary} size={12} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 44,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    overflow: 'hidden',
  },
  optionsScroll: { maxHeight: 190 },
  optionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: { fontSize: 13, color: colors.textPrimary },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  loadingText: { fontSize: 12.5, color: colors.textMuted },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.crimsonLight,
  },
  createText: { fontSize: 12.5, color: colors.crimsonDark, fontWeight: '700', flex: 1 },
  emptyText: { fontSize: 12, color: colors.textMuted, padding: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    backgroundColor: colors.cardBgElevated,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
