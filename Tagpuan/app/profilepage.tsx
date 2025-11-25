// ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

// Firebase imports
import { auth, db } from "@/firebaseConfig";
import { collection, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Custom imports
import theme from "../constants/theme";

// IMPORT API FUNCTIONS (Make sure the path points to your api.ts file)
import { 
  searchUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriendRequests, 
  getFriends 
} from "../components/Friends/FriendsAPI"; // <--- CHANGE THIS PATH TO WHERE YOUR api.ts IS LOCATED

// ---------------------- Types ----------------------
interface UserLite {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_picture?: string;
  role?: string;
  isOnline?: boolean;
}

interface FriendRequest {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  username?: string;
}

interface FriendUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  username?: string;
}

// ---------------------- Component ----------------------
const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userPosts, setUserPosts] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const params = useLocalSearchParams();
  const userId = params.userId as string | undefined;
  const { tab } = params;
  const [activeTab, setActiveTab] = useState<string>(
    tab === "posts" ? "posts" : tab === "friends" ? "friends" : "details"
  );
  
  const [certifications, setCertifications] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<{ id: string; [key: string]: any }[]>([]);
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<string[]>([]);
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Friend system states
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserLite[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const paymentList = [
    { id: "cod", name: "Cash On Delivery" },
    { id: "gcash", name: "GCash (E-Wallet)" },
    { id: "maya", name: "Maya (E-Wallet)" },
    { id: "bank", name: "Bank Transfer" },
  ];

  const deliveryModes = [
    { id: "pickup", name: "Pickup" },
    { id: "delivery", name: "Delivery" },
  ];

  const defaultProfileImage = "https://placehold.co/100x100/DDB771/073B3A?text=User"; 

  const uploadImageAsync = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // ---------------------- Fetch user data (Firestore) ----------------------
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      const uid = userId || auth.currentUser?.uid;
      if (!uid) {
        setLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setUserPosts(data.posts || []);
          setCertifications(data.certifications || []);
        } else {
          console.warn("No user document found for UID:", uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // ---------------------- Commodities listener ----------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commodities"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommodities(items);
      },
      (error) => {
        console.error("Error fetching commodities:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ---------------------- Editing effects ----------------------
  useEffect(() => {
    if (isEditing && userData?.farmer_details) {
      setSelectedDeliveryModes(userData.farmer_details.modeOfDelivery || []);
      setSelectedPaymentTerms(userData.farmer_details.paymentTerms || []);
    }
  }, [isEditing, userData]);

  useEffect(() => {
    if (isEditing && userData?.farmer_details?.commodity) {
      setSelectedCommodities(userData.farmer_details.commodity);
    }
  }, [isEditing, userData]);

  // ---------------------- Handlers ----------------------
  const handleEdit = () => {
    setEditedData(userData || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      const uid = userId || auth.currentUser.uid;
      const userRef = doc(db, "users", uid);

      // Build updated user object
      const updatedUser = {
        ...userData,
        ...editedData,
        certifications,
        farmer_details: {
          ...userData?.farmer_details,
          ...editedData?.farmer_details,
          commodity: selectedCommodities,
          modeOfDelivery: selectedDeliveryModes,
          paymentTerms: selectedPaymentTerms,
        },
        posts: userPosts,
      };

      await updateDoc(userRef, updatedUser);
      setUserData(updatedUser);
      setIsEditing(false);
      router.replace({ pathname: "/profilepage", params: { userId: uid, tab: "details" } });
    } catch (error) {
      console.error("Error updating user data:", error);
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  // ---------------------- Upload image / cert ----------------------
  const handlePickImage = async () => {
    if (userId && userId !== auth.currentUser?.uid) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
      if (result.canceled || !result.assets?.length) return;

      setUploading(true);
      const file = result.assets[0];
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User UID is undefined.");

      const fileName = `posts/${uid}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadImageAsync(file.uri, fileName);
      const updatedPosts = [downloadURL, ...userPosts];

      setUserPosts(updatedPosts);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { posts: updatedPosts });
    } catch (error) {
      console.error("Error uploading post image:", error);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handlePickCertification = async () => {
    if (userId && userId !== auth.currentUser?.uid) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
      if (result.canceled || !result.assets?.length) return;

      if (certifications.length >= 5) {
        Alert.alert("Limit Reached", "Maximum of 5 certifications allowed.");
        return;
      }

      setUploading(true);
      const file = result.assets[0];
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User UID is undefined.");

      const fileName = `certifications/${uid}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadImageAsync(file.uri, fileName);
      const updatedCerts = [...certifications, downloadURL];

      setCertifications(updatedCerts);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { certifications: updatedCerts });
    } catch (error) {
      console.error("Error uploading certification:", error);
    } finally {
      setUploading(false);
    }
  };

  // ---------------------- Friend system HANDLERS ----------------------
  
  const fetchFriendsList = async (): Promise<void> => {
    try {
      const data = await getFriends();
      setFriends(data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setFriends([]);
    }
  };

  const fetchFriendRequestsList = async (): Promise<void> => {
    try {
      const data = await getFriendRequests();
      setFriendRequests(data || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setFriendRequests([]);
    }
  };

  const handleSearchUsers = async (): Promise<void> => {
    if (searchQuery.length < 2) return;
    try {
      const data = await searchUsers(searchQuery.trim());
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    }
  };

  const sendRequest = async (receiverId: string): Promise<void> => {
    try {
      await sendFriendRequest(receiverId);
      Alert.alert("Success", "Friend request sent!");
    } catch (err: any) {
      console.warn("sendRequest failed:", err.response?.data || err.message);
      Alert.alert("Error", "Could not send friend request.");
    }
  };

  const acceptRequest = async (requesterId: string): Promise<void> => {
    try {
      await acceptFriendRequest(requesterId);
      // Refresh both lists
      await Promise.all([fetchFriendRequestsList(), fetchFriendsList()]);
    } catch (err: any) {
      console.warn("acceptRequest failed:", err.response?.data || err.message);
      Alert.alert("Error", "Could not accept request.");
    }
  };

  const rejectRequest = async (requesterId: string): Promise<void> => {
    try {
      await rejectFriendRequest(requesterId);
      await fetchFriendRequestsList();
    } catch (err: any) {
      console.warn("rejectRequest failed:", err.response?.data || err.message);
      Alert.alert("Error", "Could not reject request.");
    }
  };

  // Fetch friend data when tab is opened
  useEffect(() => {
    if (activeTab === "friends") {
      fetchFriendsList();
      fetchFriendRequestsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------------------- Loading UI ----------------------
  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  const isOwnProfile = !userId || userId === auth.currentUser?.uid;

  const getProfilePicSource = (uri?: string) => {
    return uri ? { uri } : { uri: defaultProfileImage };
  };

  // ---------------------- Render ----------------------
  return (
    <LinearGradient
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View>
          <Image
            source={getProfilePicSource(isEditing ? editedData.profile_picture : userData?.profile_picture)}
            style={styles.profileImage}
          />
          {isOwnProfile && isEditing && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
                if (result.canceled || !result.assets?.length) return;

                const file = result.assets[0];
                const uid = auth.currentUser?.uid;
                if (!uid) return;

                setUploading(true);
                try {
                  const fileName = `profile_pictures/${uid}_${Date.now()}_${file.name}`;
                  const downloadURL = await uploadImageAsync(file.uri, fileName);

                  setEditedData({
                    ...editedData,
                    profile_picture: downloadURL,
                  });
                } catch (e) {
                  Alert.alert("Error", "Failed to upload profile picture");
                } finally {
                  setUploading(false);
                }
              }}
            >
              <Text style={styles.uploadText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        <View>
          <Text style={styles.name}>
            {userData?.first_name} {userData?.last_name}
          </Text>
          <View style={styles.verifiedRow}>
            <Image
              source={
                userData?.verification === "Approved"
                  ? require("../assets/images/verified.png")
                  : require("../assets/images/error.png")
              }
              style={styles.verifiedIcon}
            />
            <Text style={styles.verifiedText}>
              {" "}
              {userData?.verification === "Approved" ? "Verified" : "Not Verified"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.tabButtonsWrapper}>
        <View style={styles.tabButtonsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "posts" && styles.activeTab]}
            onPress={() => setActiveTab("posts")}
          >
            <Text style={styles.tabText}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "details" && styles.activeTab]}
            onPress={() => setActiveTab("details")}
          >
            <Text style={styles.tabText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "friends" && styles.activeTab]}
            onPress={() => setActiveTab("friends")}
          >
            <Text style={styles.tabText}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.detailsScroll} contentContainerStyle={{ paddingBottom: 60 }}>
        {activeTab === "details" ? (
          <>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>User Details</Text>
              {isOwnProfile &&
                (isEditing ? (
                  <View style={styles.editButtonsRow}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.detailBox}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.first_name}
                  onChangeText={(text) => setEditedData({ ...editedData, first_name: text })}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.details}>First Name: {userData?.first_name}</Text>
              )}
            </View>

            <View style={styles.detailBox}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.middle_name}
                  onChangeText={(text) => setEditedData({ ...editedData, middle_name: text })}
                  placeholder="Middle Name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.details}>Middle Name: {userData?.middle_name}</Text>
              )}
            </View>

            <View style={styles.detailBox}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.last_name}
                  onChangeText={(text) => setEditedData({ ...editedData, last_name: text })}
                  placeholder="Last Name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.details}>Last Name: {userData?.last_name}</Text>
              )}
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.details}>Email: {userData?.email}</Text>
            </View>

            {/* Address */}
            <View style={styles.detailBox}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.address}
                  onChangeText={(text) => setEditedData({ ...editedData, address: text })}
                  placeholder="Address"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.details}>Address: {userData?.address || "Not specified"}</Text>
              )}
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.details}>Role: {userData?.role}</Text>
            </View>

            {/* Products Offered */}
            {userData?.role === "Farmer" && (
              <View style={styles.detailBox}>
                <Text style={styles.details}>Products Offered:</Text>
                {isEditing ? (
                  <>
                    {commodities.map((item) => {
                      const isSelected = selectedCommodities.includes(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.dropdownItem, isSelected && styles.selectedRoleButton]}
                          onPress={() => {
                            setSelectedCommodities((prev) =>
                              isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                            );
                          }}
                        >
                          <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                            {isSelected ? "✔ " : ""}
                            {item.en_name} ({item.hil_name})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {userData?.farmer_details?.commodity?.length > 0 ? (
                      userData?.farmer_details.commodity
                        .map((id: string) => {
                          const found = commodities.find((c) => c.id === id);
                          return found ? `${found.en_name} (${found.hil_name})` : null;
                        })
                        .filter(Boolean)
                        .map((item: string, index: number) => (
                          <Text key={index} style={styles.details}>
                            • {item}
                          </Text>
                        ))
                    ) : (
                      <Text style={styles.details}>Not specified</Text>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Mode of Delivery */}
            {userData?.role === "Farmer" && (
              <View style={styles.detailBox}>
                <Text style={styles.details}>Mode of Delivery:</Text>
                {isEditing ? (
                  deliveryModes.map((item) => {
                    const isSelected = selectedDeliveryModes.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.dropdownItem, isSelected && styles.selectedRoleButton]}
                        onPress={() => {
                          setSelectedDeliveryModes((prev) =>
                            isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                      >
                        <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                          {isSelected ? "✔ " : ""}
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : userData?.farmer_details?.modeOfDelivery?.length > 0 ? (
                  userData.farmer_details.modeOfDelivery.map((id: string, index: number) => {
                    const found = deliveryModes.find((d) => d.id === id);
                    return found ? (
                      <Text key={index} style={styles.details}>
                        • {found.name}
                      </Text>
                    ) : null;
                  })
                ) : (
                  <Text style={styles.details}>Not specified</Text>
                )}
              </View>
            )}

            {/* Payment Terms */}
            {userData?.role === "Farmer" && (
              <View style={styles.detailBox}>
                <Text style={styles.details}>Payment Terms:</Text>
                {isEditing ? (
                  paymentList.map((item) => {
                    const isSelected = selectedPaymentTerms.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.dropdownItem, isSelected && styles.selectedRoleButton]}
                        onPress={() => {
                          setSelectedPaymentTerms((prev) =>
                            isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                      >
                        <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                          {isSelected ? "✔ " : ""}
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : userData?.farmer_details?.paymentTerms?.length > 0 ? (
                  userData.farmer_details.paymentTerms.map((id: string, index: number) => {
                    const found = paymentList.find((p) => p.id === id);
                    return found ? (
                      <Text key={index} style={styles.details}>
                        • {found.name}
                      </Text>
                    ) : null;
                  })
                ) : (
                  <Text style={styles.details}>Not specified</Text>
                )}
              </View>
            )}

            {/* User Description */}
            <View style={styles.detailBox}>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedData.description}
                  onChangeText={(text) => setEditedData({ ...editedData, description: text })}
                  placeholder="User Description..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <>
                  <Text style={styles.detailsLabel}>User Description:</Text>
                  <Text style={styles.detailsValue}>{userData?.description?.trim() || "No description yet."}</Text>
                </>
              )}
            </View>

            {/* Certifications */}
            {userData?.role === "Farmer" && (
              <View style={styles.detailBox}>
                <Text style={styles.details}>Certifications:</Text>

                {(isEditing ? certifications : userData?.certifications || []).length === 0 ? (
                  <Text style={styles.noCertifications}>No certifications uploaded.</Text>
                ) : (
                  <View style={styles.certGrid}>
                    {(isEditing ? certifications : userData?.certifications || []).map((uri: string, index: number) => (
                      <TouchableOpacity key={index} onPress={() => setSelectedImage(uri)}>
                        <Image source={{ uri }} style={styles.certImage} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {isOwnProfile && isEditing && (
                  <TouchableOpacity style={styles.uploadButton} onPress={handlePickCertification}>
                    <Text style={styles.uploadText}>Upload Certification</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : activeTab === "posts" ? (
          <>
            <View style={styles.postHeader}>
              <Text style={styles.detailsTitle}>Posts</Text>
              {isOwnProfile && (
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                  <Text style={styles.uploadText}>Upload</Text>
                </TouchableOpacity>
              )}
            </View>

            {userPosts.length === 0 ? (
              <Text style={styles.noPosts}>No posts yet.</Text>
            ) : (
              <View style={styles.postGrid}>
                {userPosts.map((uri, index) => (
                  <TouchableOpacity key={index} onPress={() => setSelectedImage(uri)}>
                    <Image source={{ uri }} style={styles.postImage} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          // ---------------------- FRIENDS TAB UI ----------------------
          <>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.detailsTitle}>Friend Requests</Text>
            </View>

            {friendRequests.length === 0 ? (
              <Text style={{ color: "#fff", marginBottom: 12 }}>No pending requests.</Text>
            ) : (
              friendRequests.map((req) => (
                <View style={styles.friendRow} key={req.id}>
                  <Image source={getProfilePicSource(req.profile_picture)} style={styles.friendAvatar} />
                  <Text style={styles.friendName}>
                    {req.first_name} {req.last_name}
                  </Text>

                  <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRequest(req.id)}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.rejectButton} onPress={() => rejectRequest(req.id)}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <View style={{ marginTop: 18, marginBottom: 12 }}>
              <Text style={styles.detailsTitle}>Friends</Text>
            </View>

            {friends.length === 0 ? (
              <Text style={{ color: "#fff", marginBottom: 12 }}>No friends yet.</Text>
            ) : (
              friends.map((fr) => (
                <View style={styles.friendRow} key={fr.id}>
                  <Image source={getProfilePicSource(fr.profile_picture)} style={styles.friendAvatar} />
                  <Text style={styles.friendName}>
                    {fr.first_name} {fr.last_name}
                  </Text>
                </View>
              ))
            )}

            <View style={{ marginTop: 18 }}>
              <Text style={styles.detailsTitle}>Search Users</Text>
            </View>

            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <TextInput
                placeholder="Search users (min 2 chars)"
                placeholderTextColor="#ccc"
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchUsers}
              />
            </View>

            {searchResults.length === 0 ? (
              <Text style={{ color: "#fff" }}>No results.</Text>
            ) : (
              searchResults.map((user) => (
                <View style={styles.friendRow} key={user.id}>
                  <Image source={getProfilePicSource(user.profile_picture)} style={styles.friendAvatar} />
                  <Text style={styles.friendName}>
                    {user.first_name} {user.last_name}
                  </Text>

                  <TouchableOpacity style={styles.addButton} onPress={() => sendRequest(user.id)}>
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Uploading Overlay */}
      {uploading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#DDB771" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Uploading...</Text>
        </View>
      )}

      {/* Image modal */}
      {selectedImage && (
        <Modal visible transparent onRequestClose={() => setSelectedImage(null)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity
              style={{ position: "absolute", top: 50, right: 20, zIndex: 1 }}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={{ color: "#fff", fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={{ width: "90%", height: "70%", resizeMode: "contain" }} />
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    marginTop: 8,
    letterSpacing: 1,
    color: "#DDB771",
    fontFamily: theme.fonts.regular,
    fontSize: 20,
  },
  backButton: {
    position: "absolute",
    right: 20,
    top: 0,
    borderWidth: 2,
    borderColor: "#DDB771",
    borderRadius: 4,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#DDB771",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "#0B6E4F", // Fallback background
  },
  name: {
    fontSize: 20,
    fontFamily: "NovaSquare-Regular",
    color: "#DDB771",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  verifiedIcon: {
    width: 16,
    height: 16,
  },
  verifiedText: {
    color: "#DDB771",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  divider: {
    width: "96%",
    height: 1,
    backgroundColor: "#DDB771",
    alignSelf: "center",
    marginVertical: 12,
  },
  detailsScroll: {
    paddingHorizontal: 20,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detailsTitle: {
    color: "#DDB771",
    fontSize: 18,
    fontFamily: "NovaSquare-Regular",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#DDB771",
    borderRadius: 8,
  },
  editText: {
    color: "#073B3A",
    fontFamily: "NovaSquare-Regular",
    fontSize: 14,
  },
  editButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#DDB771",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  cancelText: {
    color: "#073B3A",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  saveButton: {
    backgroundColor: "#DDB771",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  saveText: {
    color: "#073B3A",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  detailBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 4,
  },
  details: {
    fontSize: 14,
    color: "#08A045",
    fontFamily: "NovaSquare-Regular",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    color: "#073B3A",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#073B3A",
  },
  postSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: "#DDB771",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 12,
  },
  uploadText: {
    color: "#073B3A",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  noPosts: {
    color: "#fff",
    fontFamily: "NovaSquare-Regular",
    fontSize: 14,
  },
  noCertifications: {
    color: "#ccc",
    fontFamily: "NovaSquare-Regular",
    fontSize: 14,
  },
  postGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  tabButtonsWrapper: {
    width: "96%",
    alignSelf: "center",
    marginBottom: 10,
  },
  tabButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0B6E4F",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#DDB771",
  },
  tabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  certGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  certImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#08A045",
  },
  dropdownText: {
    color: "#08A045",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  selectedRoleButton: {
    backgroundColor: "#08A045",
  },
  selectedRoleText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "NovaSquare-Regular",
  },
  textArea: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  detailsLabel: {
    fontSize: 14,
    color: "#08A045",
    fontFamily: "NovaSquare-Regular",
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "NovaSquare-Regular",
    lineHeight: 20,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  friendAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#ddd",
  },
  friendName: {
    color: "#073B3A",
    fontSize: 15,
    flex: 1,
    fontFamily: "NovaSquare-Regular",
  },
  acceptButton: {
    backgroundColor: "#08A045",
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  rejectButton: {
    backgroundColor: "#b13333",
    padding: 8,
    borderRadius: 8,
  },
  acceptText: {
    color: "#fff",
  },
  rejectText: {
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#DDB771",
    padding: 8,
    borderRadius: 8,
  },
  addText: {
    color: "#073B3A",
  },
});

export default ProfilePage;