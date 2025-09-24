import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// producto
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: string;
  categoria: string;
  url_fotografia: string;
}


const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function App() {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list'); // 'list', 'form', 'details'
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    estado: 'Disponible',
    categoria: '',
    url_fotografia: 'https://placehold.co/100x100'
  });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Efecto para solicitar permisos de la cámara y cargar los productos al inicio.
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
    fetchProductos();
  }, []);

  // Función para obtener la lista de productos de la API.
  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const json = await response.json();
      if (json.data) {
        setProductos(json.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron obtener los productos.");
    }
  };

  // Función para crear un nuevo producto a través de la API.
  const handleCreateProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (json.error) {
        Alert.alert("Error", json.error);
      } else {
        Alert.alert("Éxito", "Producto creado con éxito.");
        setForm({
          nombre: '',
          descripcion: '',
          precio: '',
          estado: 'Disponible',
          categoria: '',
          url_fotografia: 'https://placehold.co/100x100'
        });
        fetchProductos();
        setView('list');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear el producto.");
    }
  };

  // elimiar producto de la api 
  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (json.error) {
        Alert.alert("Error", json.error);
      } else {
        Alert.alert("Éxito", "Producto eliminado con éxito.");
        fetchProductos();
        setView('list');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };

  // tomo fotos con la camara 
  const handleTakePicture = async () => {
    if (hasCameraPermission === false) {
      Alert.alert("Error", "No se tiene permiso para acceder a la cámara.");
      return;
    }
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const newUrl = `data:image/jpeg;base64,${photo.base64}`;
      setForm({ ...form, url_fotografia: newUrl });
    }
  };

  // --- Vistas de la aplicación (renderizado condicional) ---

  const renderForm = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Producto</Text>
      <TextInput
        style={styles.input}
        placeholder="....."
        value={form.nombre}
        onChangeText={(text) => setForm({ ...form, nombre: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="......"
        value={form.descripcion}
        onChangeText={(text) => setForm({ ...form, descripcion: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="....."
        keyboardType="numeric"
        value={form.precio}
        onChangeText={(text) => setForm({ ...form, precio: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado (Disponible o No disponible)"
        value={form.estado}
        onChangeText={(text) => setForm({ ...form, estado: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="......"
        value={form.categoria}
        onChangeText={(text) => setForm({ ...form, categoria: text })}
      />
      <View style={styles.cameraContainer}>
        {hasCameraPermission === true && (
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={cameraRef}
          />
        )}
        <TouchableOpacity style={styles.cameraButton} onPress={handleTakePicture}>
          <Text style={styles.buttonText}>Tomar Foto</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={{ uri: form.url_fotografia }}
        style={styles.imagePlaceholder}
        onError={() => setForm({ ...form, url_fotografia: 'https://placehold.co/100x100' })}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateProduct}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setView('list')}>
        <Text style={styles.buttonText}>Ver Productos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderList = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Productos</Text>
      <TouchableOpacity style={styles.button} onPress={() => setView('form')}>
        <Text style={styles.buttonText}>Agregar Nuevo Producto</Text>
      </TouchableOpacity>
      <ScrollView style={styles.tableContainer}>
        {productos.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Nombre</Text>
              <Text style={styles.tableHeaderText}>Precio</Text>
              <Text style={styles.tableHeaderText}>Acciones</Text>
            </View>
            {productos.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.nombre}</Text>
                <Text style={styles.tableCell}>{item.precio}</Text>
                <TouchableOpacity
                  style={styles.verButton}
                  onPress={() => {
                    setSelectedProduct(item);
                    setView('details');
                  }}
                >
                  <Text style={styles.verButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Producto</Text>
      {selectedProduct && (
        <View style={styles.detailsContainer}>
          <Image
            source={{ uri: selectedProduct.url_fotografia }}
            style={styles.imageFull}
            onError={() => setSelectedProduct({ ...selectedProduct, url_fotografia: 'https://placehold.co/200x200' })}
          />
          <Text style={styles.detailText}>Nombre: {selectedProduct.nombre}</Text>
          <Text style={styles.detailText}>Descripción: {selectedProduct.descripcion}</Text>
          <Text style={styles.detailText}>Precio: {selectedProduct.precio}</Text>
          <Text style={styles.detailText}>Estado: {selectedProduct.estado}</Text>
          <Text style={styles.detailText}>Categoría: {selectedProduct.categoria}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(selectedProduct.id)}>
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => setView('list')}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="auto" />
      {view === 'form' && renderForm()}
      {view === 'list' && renderList()}
      {view === 'details' && renderDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  container: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tableContainer: {
    width: '100%',
    marginTop: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  verButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  verButtonText: {
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  imageFull: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  cameraContainer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
  },
  camera: {
    flex: 1,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -50 }],
    borderRadius: 8,
  },
});