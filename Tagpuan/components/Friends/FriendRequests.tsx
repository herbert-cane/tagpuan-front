import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from "@/services/friendApi";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const res = await getFriendRequests();
    setRequests(res);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const accept = async (id: string) => {
    await acceptFriendRequest(id);
    loadRequests();
  };

  const reject = async (id: string) => {
    await rejectFriendRequest(id);
    loadRequests();
  };

  return (
    <View style={{ padding: 16 }}>
      {requests.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>No pending requests.</Text>
      ) : (
        requests.map((req: any) => (
          <View key={req.id} style={styles.row}>
            <Image source={{ uri: req.profile_picture }} style={styles.avatar} />
            <Text style={styles.name}>{req.first_name} {req.last_name}</Text>

            <TouchableOpacity style={styles.acceptBtn} onPress={() => accept(req.id)}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(req.id)}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 10,
  },
  avatar: { width: 45, height: 45, borderRadius: 22 },
  name: { marginLeft: 10, fontSize: 15, flex: 1 },
  acceptBtn: { backgroundColor: "#08A045", padding: 8, borderRadius: 6, marginRight: 5 },
  rejectBtn: { backgroundColor: "#b53333", padding: 8, borderRadius: 6 },
  btnText: { color: "#fff", fontSize: 13 },
});
