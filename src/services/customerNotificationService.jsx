import * as signalR from '@microsoft/signalr';

class CustomerNotificationService {
  constructor() {
    this.connection = null;
    this.callbacks = [];
  }

  init = async () => {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7000/customernotificationhub') // Update with your API URL
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveNotification', (message) => {
      this.callbacks.forEach(callback => callback(message));
    });

    try {
      await this.connection.start();
      console.log('Customer Notification SignalR Connected');
    } catch (err) {
      console.error('Customer Notification SignalR Connection Error: ', err);
      setTimeout(this.init, 5000);
    }
  }

  onNotification = (callback) => {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect = async () => {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.callbacks = [];
    }
  }
}

const customerNotificationService = new CustomerNotificationService();
export default customerNotificationService;