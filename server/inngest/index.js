import { Inngest } from "inngest";
import User from "../models/User.js"; // Capitalize model name

// Create a client
export const inngest = new Inngest({ id: "ticket-booking" });

// Sync user creation from Clerk
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" }, // check exact name from Clerk webhook
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.create(userData);
  }
);

// Sync user update from Clerk
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const updatedData = {
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.findByIdAndUpdate(id, updatedData, { new: true });
  }
);


// Sync user deletion from Clerk
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" }, // corrected event name
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

export const functions = [syncUserCreation, syncUserDeletion,syncUserUpdate];
