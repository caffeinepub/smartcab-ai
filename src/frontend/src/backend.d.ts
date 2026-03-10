import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    status: string;
    dropoff: string;
    carModel: string;
    duration: bigint;
    driverRating: bigint;
    vehicleNumber: string;
    fare: bigint;
    distance: bigint;
    pickup: string;
    driverEta: bigint;
    userRating: bigint;
    rideType: string;
    driverName: string;
}
export interface UserProfile {
    name: string;
    phone: string;
}
export interface Notification {
    read: boolean;
    message: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNotification(message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(pickup: string, dropoff: string, rideType: string, fare: bigint, distance: bigint, duration: bigint, driverName: string, vehicleNumber: string, carModel: string, driverRating: bigint, driverEta: bigint): Promise<bigint>;
    getAISuggestion(pickup: string, dropoff: string): Promise<{
        reasoning: string;
        rideType: string;
    }>;
    getAITripSummary(bookingId: bigint): Promise<string>;
    getCallerBookings(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNotifications(): Promise<Array<Notification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<void>;
    saveCallerUserProfile(userProfile: UserProfile): Promise<void>;
    submitDriverRating(bookingId: bigint, rating: bigint): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: string): Promise<void>;
}
