import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Notification, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pickup: string;
      dropoff: string;
      rideType: string;
      fare: number;
      distance: number;
      duration: number;
      driverName: string;
      vehicleNumber: string;
      carModel: string;
      driverRating: number;
      driverEta: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.createBooking(
        params.pickup,
        params.dropoff,
        params.rideType,
        BigInt(params.fare),
        BigInt(params.distance),
        BigInt(params.duration),
        params.driverName,
        params.vehicleNumber,
        params.carModel,
        BigInt(Math.round(params.driverRating * 10)),
        BigInt(params.driverEta),
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: bigint; status: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateBookingStatus(params.bookingId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useSubmitRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: bigint; rating: number }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.submitDriverRating(params.bookingId, BigInt(params.rating));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useGetAISuggestion() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { pickup: string; dropoff: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAISuggestion(params.pickup, params.dropoff);
    },
  });
}

export function useGetAITripSummary() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAITripSummary(bookingId);
    },
  });
}

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAddNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addNotification(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
