import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import SearchUsers from "./SearchUsers";
import FriendRequests from "./FriendRequests";
import FriendsList from "./FriendsList";

export default function FriendsPage() {
  const [tab, setTab] = useState("friends");

  return (
    <View style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab("friends")} style={[styles.tab, tab === "friends" && styles.activeTab]}>
          <Text style={styles.tabText}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab("requests")} style={[styles.tab, tab === "requests" && styles.activeTab]}>
          <Text style={styles.tabText}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab("search")} style={[styles.tab, tab === "search" && styles.activeTab]}>
          <Text style={styles.tabText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === "friends" && <FriendsList />}
      {tab === "requests" && <FriendRequests />}
      {tab === "search" && <SearchUsers />}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: "#073B3A",
    paddingVertical: 12,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  activeTab: { backgroundColor: "#0B6E4F" },
  tabText: { color: "#fff", fontSize: 14 },
});
