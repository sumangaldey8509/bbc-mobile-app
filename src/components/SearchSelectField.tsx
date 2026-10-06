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
import { Search, X, ChevronDown, CornerDownLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Option {
  id: string;
  name: string;
}

interface Props {
  label: string;
  /** Current selected display name ('' if none). */
  value: string;
  onSelect: (option: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledHint?: string;
  search: (q: string) => Promise<Option[]>;
  /** Optional find-or-create (city has it, state doesn't). */
  createEntry?: (name: string) => Promise<{ name: string }>;
  hint?: string;
}

const MIN_CHARS = 1;

export const SearchSelectField: React.FC<Props> = ({
  label,
  value,
  onSelect,
  placeholder,
  disabled = false,
  disabledHint,
  search,
  createEntry,
  hint,
}) => {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [focused, setFocused] = useState(false);
  const reqId = useRef(0);

  const trimmed = query.trim();
  const lc = (s: string) => s.trim().toLowerCase();

  useEffect(() => {
    if (!editing || trimmed.length < MIN_CHARS) {
      reqId.current++;
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
  }, [trimmed, editing]);

  const choose = (opt: Option) => {
    onSelect(opt);
    setEditing(false);
    setQuery('');
    setOptions([]);
    setLoading(false);
  };

  const addTyped = async () => {
    if (!trimmed || adding || !createEntry) return;
    const exact = options.find(o => lc(o.name) === lc(trimmed));
    if (exact) return choose(exact);
    setAdding(true);
    try {
      const res = await createEntry(trimmed);
      choose({ id: res.name, name: res.name });
    } finally {
      setAdding(false);
    }
  };

  const startEditing = () => {
    if (disabled) return;
    setEditing(true);
    setQuery('');
    setFocused(true);
  };

  const clear = () => {
    onSelect(null);
    setEditing(false);
    setQuery('');
  };

  const exactExists = options.some(o => lc(o.name) === lc(trimmed));
  const showCreateRow = !!createEntry && trimmed.length >= 2 && !exactExists;
  const showDropdown = editing && focused && trimmed.length >= MIN_CHARS;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      {!editing ? (
        <TouchableOpacity
          style={[styles.selectBtn, disabled && styles.disabled]}
          onPress={startEditing}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
            {value || placeholder || 'Select…'}
          </Text>
          {value && !disabled ? (
            <TouchableOpacity onPress={clear} hitSlop={10}>
              <X color={colors.textMuted} size={15} />
            </TouchableOpacity>
          ) : (
            <ChevronDown color={colors.textMuted} size={16} />
          )}
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.inputBox}>
            <Search color={colors.textMuted} size={15} />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onSubmitEditing={addTyped}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
            />
            {(loading || adding) && <ActivityIndicator size="small" color={colors.textMuted} />}
            <TouchableOpacity
              onPress={() => {
                setEditing(false);
                setQuery('');
              }}
              hitSlop={10}
            >
              <X color={colors.textMuted} size={15} />
            </TouchableOpacity>
          </View>

          {showDropdown && (
            <View style={styles.dropdown}>
              {loading && options.length === 0 ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.textMuted} />
                  <Text style={styles.loadingText}>Searching…</Text>
                </View>
              ) : (
                <>
                  {options.length > 0 && (
                    <ScrollView
                      style={styles.optionsScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {options.map(o => (
                        <TouchableOpacity
                          key={o.id}
                          style={styles.optionRow}
                          onPress={() => choose(o)}
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
                      <Text style={styles.createText}>Add “{trimmed}”</Text>
                    </TouchableOpacity>
                  )}
                  {!loading && options.length === 0 && !showCreateRow && (
                    <Text style={styles.emptyText}>No matches</Text>
                  )}
                </>
              )}
            </View>
          )}
        </>
      )}

      {disabled && disabledHint ? (
        <Text style={styles.hint}>{disabledHint}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.5 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  disabled: { opacity: 0.5 },
  selectValue: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  selectPlaceholder: { fontSize: 14, color: colors.textMuted, flex: 1 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: { flex: 1, paddingVertical: 9, fontSize: 14, color: colors.textPrimary },
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
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
