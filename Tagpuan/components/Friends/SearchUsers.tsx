import React, { useState } from "react";
import { View, TextInput, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { searchUsers, sendFriendRequest } from "@/services/friendApi";

export default function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const res = await searchUsers(query);
      setResults(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      await sendFriendRequest(receiverId);
      alert("Friend request sent!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Search Input */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search users..."
        placeholderTextColor="#777"
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />

      {/* Results */}
      {results.map((user) => (
        <View key={user.id} style={styles.userRow}>
          <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleSendRequest(user.id)}
          >
            <Text style={styles.addBtnText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "600" },
  username: { color: "#555", fontSize: 12 },
  addBtn: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#08A045",
    borderRadius: 10,
  },
  addBtnText: { color: "#fff" },
});
