import React, { useEffect, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import Field from '../components/Field';
import { createDestination, getDestination, updateDestination } from '../db/database';
import { pickPhotos } from '../utils/photos';
import { useAppTheme } from '../ThemeContext';
import { categories, colors, provinces } from '../theme';

const EMPTY = {
  name: '', description: '', address: '', province: 'Laguna', category: 'Historical',
  imageUri: '', history: '', significance: '', tourUrl: '', photos: [],
};

export default function DestinationFormScreen({ route, navigation }) {
  const { background, text } = useAppTheme();
  const id = route.params?.id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Edit destination' : 'Add destination' });
    if (!id) return;
    getDestination(id).then((d) => {
      if (!d) return;
      setForm({
        ...EMPTY,
        name: d.name, description: d.description, address: d.address,
        province: d.province || 'Laguna', category: d.category,
        imageUri: d.imageUri || '', history: d.history || '', significance: d.significance || '',
        tourUrl: d.tourUrl || '', photos: d.photos || [],
      });
    });
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter the destination name.';
    if (!form.description.trim()) e.description = 'Add a short description.';
    if (!form.address.trim()) e.address = 'Enter the address or town.';
    if (form.tourUrl.trim() && !/^https?:\/\//i.test(form.tourUrl.trim())) {
      e.tourUrl = 'Start the link with http:// or https://';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      name: form.name.trim(), description: form.description.trim(), address: form.address.trim(),
      history: form.history.trim(), significance: form.significance.trim(), tourUrl: form.tourUrl.trim(),
    };
    try {
      if (id) await updateDestination(id, payload);
      else await createDestination(payload);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const choosePhotos = async (multiple) => {
    const picked = await pickPhotos(multiple);
    if (!picked.length) return;
    if (multiple) set('photos', [...form.photos, ...picked]);
    else set('imageUri', picked[0]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: background }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Field label="Name" value={form.name} onChangeText={(v) => set('name', v)} error={errors.name} placeholder="e.g., Pila Historic Town Center" />
        <Field label="Description" value={form.description} onChangeText={(v) => set('description', v)} error={errors.description} multiline placeholder="What is this place and why visit it?" />
        <Field label="Address" value={form.address} onChangeText={(v) => set('address', v)} error={errors.address} placeholder="Town, province" />

        <Text style={[styles.label, { color: text }]}>Province</Text>
        <View style={styles.chips}>
          {provinces.map((p) => (
            <CategoryChip key={p} label={p} active={form.province === p} onPress={() => set('province', p)} />
          ))}
        </View>

        <Text style={[styles.label, { color: text }]}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <CategoryChip key={c} label={c} active={form.category === c} onPress={() => set('category', c)} />
          ))}
        </View>

        <Text style={[styles.label, { color: text }]}>Cover image</Text>
        {form.imageUri ? <Image source={{ uri: form.imageUri }} style={styles.cover} /> : null}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <Button label="Choose photo" icon="image-plus" variant="secondary" style={{ flex: 1 }} onPress={() => choosePhotos(false)} />
          {form.imageUri ? <Button label="Remove" variant="danger" onPress={() => set('imageUri', '')} /> : null}
        </View>
        <Field
          label="Or paste an image link"
          value={form.imageUri.startsWith('data:') ? '' : form.imageUri}
          onChangeText={(v) => set('imageUri', v)}
          autoCapitalize="none" keyboardType="url" placeholder="https://…"
        />

        <Text style={[styles.label, { color: text }]}>Virtual tour details</Text>
        <Field label="History" value={form.history} onChangeText={(v) => set('history', v)} multiline placeholder="Key events and background" />
        <Field label="Cultural significance" value={form.significance} onChangeText={(v) => set('significance', v)} multiline placeholder="Why this place matters to Filipino heritage" />
        <Field
          label="360° tour link (optional)" value={form.tourUrl} onChangeText={(v) => set('tourUrl', v)}
          error={errors.tourUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…"
        />

        <Text style={[styles.label, { color: text }]}>Tour photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {form.photos.map((uri, i) => (
            <View key={i} style={{ marginRight: 10 }}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable
                style={styles.remove}
                accessibilityLabel="Remove photo"
                onPress={() => set('photos', form.photos.filter((_, idx) => idx !== i))}
              >
                <Icon name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Pressable style={[styles.thumb, styles.add]} onPress={() => choosePhotos(true)} accessibilityLabel="Add tour photos">
            <Icon name="plus" size={28} color={colors.primary} />
          </Pressable>
        </ScrollView>

        <Button label={id ? 'Save changes' : 'Add destination'} icon="content-save-outline" onPress={save} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginBottom: 16 },
  cover: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  thumb: { width: 96, height: 96, borderRadius: 8 },
  add: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  remove: {
    position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
});
