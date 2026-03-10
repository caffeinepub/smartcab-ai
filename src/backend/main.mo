import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    name : Text;
    phone : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.name, profile2.name)) {
        case (#equal) { Text.compare(profile1.phone, profile2.phone) };
        case (order) { order };
      };
    };
  };

  type Booking = {
    id : Nat;
    pickup : Text;
    dropoff : Text;
    rideType : Text;
    fare : Nat;
    distance : Nat;
    duration : Nat;
    status : Text;
    driverName : Text;
    vehicleNumber : Text;
    carModel : Text;
    driverRating : Nat; // 0-50 (0.0-5.0 scale)
    driverEta : Nat; // Minutes
    userRating : Nat; // 1-5 stars
  };

  module Booking {
    public func compare(booking1 : Booking, booking2 : Booking) : Order.Order {
      Nat.compare(booking1.id, booking2.id);
    };
  };

  type Notification = {
    message : Text;
    read : Bool;
  };

  module Notification {
    public func compareByMessage(notification1 : Notification, notification2 : Notification) : Order.Order {
      Text.compare(notification1.message, notification2.message);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let bookings = Map.empty<Principal, List.List<Booking>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var nextBookingId = 1;

  // User Profile Functions
  public shared ({ caller }) func saveCallerUserProfile(userProfile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Booking Functions
  public shared ({ caller }) func createBooking(
    pickup : Text,
    dropoff : Text,
    rideType : Text,
    fare : Nat,
    distance : Nat,
    duration : Nat,
    driverName : Text,
    vehicleNumber : Text,
    carModel : Text,
    driverRating : Nat,
    driverEta : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    let booking : Booking = {
      id = nextBookingId;
      pickup;
      dropoff;
      rideType;
      fare;
      distance;
      duration;
      status = "pending";
      driverName;
      vehicleNumber;
      carModel;
      driverRating;
      driverEta;
      userRating = 0;
    };

    let userBookings = switch (bookings.get(caller)) {
      case (null) {
        let newList = List.empty<Booking>();
        bookings.add(caller, newList);
        newList;
      };
      case (?list) { list };
    };

    userBookings.add(booking);
    nextBookingId += 1;
    booking.id;
  };

  public query ({ caller }) func getCallerBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access bookings");
    };
    switch (bookings.get(caller)) {
      case (null) { [] };
      case (?userBookings) { userBookings.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bookings");
    };
    switch (bookings.get(caller)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?userBookings) {
        var found = false;
        let updatedBookings = userBookings.map<Booking, Booking>(
          func(booking) {
            if (booking.id == bookingId) {
              found := true;
              { booking with status };
            } else {
              booking;
            };
          }
        );
        if (not found) { Runtime.trap("Booking not found") };
        bookings.add(caller, updatedBookings);
      };
    };
  };

  public shared ({ caller }) func submitDriverRating(bookingId : Nat, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate drivers");
    };
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };
    switch (bookings.get(caller)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?userBookings) {
        var found = false;
        let updatedBookings = userBookings.map<Booking, Booking>(
          func(booking) {
            if (booking.id == bookingId) {
              found := true;
              { booking with userRating = rating };
            } else {
              booking;
            };
          }
        );
        if (not found) { Runtime.trap("Booking not found") };
        bookings.add(caller, updatedBookings);
      };
    };
  };

  // AI Suggestion and Trip Summary (Simulated)
  public query ({ caller }) func getAISuggestion(pickup : Text, dropoff : Text) : async {
    rideType : Text;
    reasoning : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get suggestions");
    };
    let rideType = if (pickup.contains(#char 'p') or dropoff.contains(#char 'd')) {
      "Sedan";
    } else {
      "Mini";
    };
    {
      rideType;
      reasoning = "Based on your locations, a " # rideType # " is recommended.";
    };
  };

  public query ({ caller }) func getAITripSummary(bookingId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get trip summaries");
    };
    // Verify the booking belongs to the caller
    switch (bookings.get(caller)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?userBookings) {
        var found = false;
        for (booking in userBookings.values()) {
          if (booking.id == bookingId) {
            found := true;
          };
        };
        if (not found) { Runtime.trap("Booking not found") };
      };
    };
    let summary = "Trip ID " # bookingId.toText() # " was completed successfully.";
    summary;
  };

  // Notification Functions
  public shared ({ caller }) func addNotification(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notifications");
    };
    let notification = {
      message;
      read = false;
    };
    let userNotifications = switch (notifications.get(caller)) {
      case (null) { List.empty<Notification>() };
      case (?existing) { existing };
    };
    userNotifications.add(notification);
    notifications.add(caller, userNotifications);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) { userNotifications.values().toArray().sort(Notification.compareByMessage) };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { () };
      case (?userNotifications) {
        let updatedNotifications = userNotifications.map<Notification, Notification>(
          func(notification) { { notification with read = true } }
        );
        notifications.add(caller, updatedNotifications);
      };
    };
  };
};
