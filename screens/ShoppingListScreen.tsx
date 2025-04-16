import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

type ShoppingItem = {
  id: number;
  list_item: string;
  bought: boolean;
  created_at: string;
  userid: string;
};export default function ShoppingListScreen({ navigation }: any) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
    getShoppingItems();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }
  async function getShoppingItems() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: false });      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  async function addShoppingItem() {
    if (!newItem.trim()) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shopping_list')
        .insert([
          { list_item: newItem.trim(), userid: user?.id, bought: false },
        ])
        .select();

      if (error) throw error;
        if (data) {
        setItems([...data, ...items]);
        setNewItem('');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  async function toggleItemCompletion(id: number, currentStatus: boolean) {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('shopping_list')
        .update({ bought: !currentStatus })
        .eq('id', id);

      if (error) throw error;
        setItems(items.map(item => 
        item.id === id ? { ...item, bought: !currentStatus } : item
      ));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  async function deleteShoppingItem(id: number) {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
        setItems(items.filter(item => item.id !== id));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new item"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addShoppingItem}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addShoppingItem}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color="#0284c7" style={styles.loader} />
      ) : (        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, item.bought && styles.checkboxChecked]} 
                onPress={() => toggleItemCompletion(item.id, item.bought)}
              >
                {item.bought && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text 
                style={[
                  styles.itemText, 
                  item.bought && styles.itemTextCompleted
                ]}
              >
                {item.list_item}
              </Text>
              <TouchableOpacity 
                onPress={() => deleteShoppingItem(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No items in your shopping list
              </Text>
              <Text style={styles.emptySubText}>
                Add items using the field above
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 44, // Safe area padding
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#0284c7',
    borderRadius: 8,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0284c7',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0284c7',
  },
  checkmark: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#71717a',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
