import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true });
  }
  return socket;
};

export const joinRideRoom = (rideId) => getSocket().emit('join_ride_room', rideId);
export const joinParcelRoom = (parcelId) => getSocket().emit('join_parcel_room', parcelId);

export const onRideStatusUpdate = (callback) => {
  getSocket().on('ride_status_update', callback);
  return () => getSocket().off('ride_status_update', callback);
};

export const onNewRequest = (callback) => {
  getSocket().on('new_ride_request', callback);
  getSocket().on('new_parcel_request', callback);
  return () => {
    getSocket().off('new_ride_request', callback);
    getSocket().off('new_parcel_request', callback);
  };
};
