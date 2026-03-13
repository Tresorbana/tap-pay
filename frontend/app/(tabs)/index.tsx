import { Image } from 'expo-image';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';

const BACKEND_URL = 'http://192.168.1.100:9205'; // Replace with actual backend IP or Render URL
const WS_URL = 'ws://192.168.1.100:9205'; // Replace with actual backend IP or Render URL

export default function TapAndPayScreen() {
  const [uid, setUid] = useState('---------');
  const [balance, setBalance] = useState('0.00');
  const [amount, setAmount] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setConnected(true);
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
        // Retry connection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setCurrentUid(data.uid);
        setUid(data.uid);
        setBalance(parseFloat(data.balance).toFixed(2));
        
        // Trigger flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 100);
      };

      ws.onerror = (e) => {
        console.error('WebSocket Error:', e);
      };
    } catch (err) {
      console.error('Connection Error:', err);
    }
  };

  const handleTopup = async () => {
    if (!currentUid) {
      Alert.alert('ERR', 'NO_CARD_DETECTED');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('ERR', 'INVALID_AMOUNT');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUid, amount: amt }),
      });

      if (response.ok) {
        setAmount('');
        console.log('TX_SUCCESS');
      } else {
        Alert.alert('ERR', 'TX_FAILED_ON_SERVER');
      }
    } catch (error) {
      console.error('TX_ERROR:', error);
      Alert.alert('ERR', 'TX_FAILED');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.terminalContainer}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>RFID TERMINAL v1.0.7</Text>
          <Text style={[styles.headerStatus, { color: connected ? '#000' : '#777' }]}>
            [{connected ? 'ACTIVE' : 'OFFLINE'}]
          </Text>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* System Readout */}
          <View style={[styles.systemReadout, flash && styles.flashBorder]}>
            <Text style={styles.sectionLabel}>[CARD_DATA]</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>UID:</Text>
              <Text style={styles.dataValue}>{uid}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>BAL:</Text>
              <Text style={styles.dataValue}>{balance}</Text>
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.sectionLabel}>[TX_INITIALIZE]</Text>
            <TextInput
              style={styles.input}
              placeholder="ENTER_AMOUNT"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoComplete="off"
            />
            <TouchableOpacity style={styles.button} onPress={handleTopup}>
              <Text style={styles.buttonText}>EXECUTE_TOPUP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Footer */}
        <View style={styles.statusFooter}>
          <Text style={styles.footerText}>TEAM_07 // SECURE_NODE</Text>
          <Text style={[styles.footerText, { color: connected ? '#fff' : '#777' }]}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  terminalContainer: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#fff',
    padding: 2,
    backgroundColor: '#000',
  },
  headerBar: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  headerStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  contentArea: {
    padding: 20,
    gap: 20,
  },
  systemReadout: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 15,
    position: 'relative',
  },
  flashBorder: {
    borderColor: '#777',
  },
  sectionLabel: {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: '#000',
    paddingHorizontal: 5,
    fontSize: 10,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    color: '#777',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  dataValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  inputGroup: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    color: '#fff',
    padding: 12,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  statusFooter: {
    borderTopWidth: 1,
    borderTopColor: '#fff',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 10,
    color: '#777',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
});
