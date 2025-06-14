import {
  StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#007AFF',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    input: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#e1e5e9',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    linkButton: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    linkText: {
      color: '#007AFF',
      fontSize: 14,
    },
    testCredentials: {
      marginTop: 32,
      padding: 16,
      backgroundColor: '#e3f2fd',
      borderRadius: 8,
      alignItems: 'center',
    },
    testTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1976d2',
      marginBottom: 4,
    },
    testText: {
      fontSize: 12,
      color: '#1976d2',
    },
  });