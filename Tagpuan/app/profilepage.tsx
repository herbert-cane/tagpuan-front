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
import { router } from "expo-router";
import theme from "../constants/theme";
import { auth, db } from "@/firebaseConfig";
// ✅ Added deleteDoc
import { collection, doc, getDoc, onSnapshot, updateDoc, query, where, orderBy, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams } from "expo-router";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// ✅ Added Icon
import { FontAwesome } from '@expo/vector-icons';

// ---------------------- CONFIGURATION ----------------------
const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

interface LocalPost {
    id: string;
    content: string;
    mediaUrl?: string;
    timestamp: any;
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [userPosts, setUserPosts] = useState<LocalPost[]>([]);
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
    return await getDownloadURL(storageRef);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      const uid = userId || auth.currentUser?.uid;
      if (!uid) { setLoadingUser(false); return; }
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setCertifications(data.certifications || []);
        }
      } catch (error) { console.error(error); } 
      finally { setLoadingUser(false); }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
        collection(db, "posts"),
        where("authorId", "==", uid),
        orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as LocalPost[];
        setUserPosts(postsData);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "commodities"), (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCommodities(items);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isEditing && userData?.farmer_details) {
      setSelectedDeliveryModes(userData.farmer_details.modeOfDelivery || []);
      setSelectedPaymentTerms(userData.farmer_details.paymentTerms || []);
      if(userData.farmer_details.commodity) setSelectedCommodities(userData.farmer_details.commodity);
    }
  }, [isEditing, userData]);

  const handleEdit = () => { setEditedData(userData || {}); setIsEditing(true); };
  const handleCancel = () => { setIsEditing(false); setEditedData({}); };
  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const uid = userId || auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      const updatedUser = {
        ...userData, ...editedData, certifications,
        farmer_details: {
          ...userData?.farmer_details, ...editedData?.farmer_details,
          commodity: selectedCommodities, modeOfDelivery: selectedDeliveryModes, paymentTerms: selectedPaymentTerms,
        },
      };
      await updateDoc(userRef, updatedUser);
      setUserData(updatedUser);
      setIsEditing(false);
      router.replace({ pathname: "/profilepage", params: { userId: uid, tab: "details" } });
    } catch (error) { Alert.alert("Error", "Failed to save profile."); }
  };

  const handlePickCertification = async () => {
    if (userId && userId !== auth.currentUser?.uid) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
      if (result.canceled || !result.assets?.length) return;
      if (certifications.length >= 5) { Alert.alert("Limit Reached", "Max 5 certs."); return; }
      setUploading(true);
      const file = result.assets[0];
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const fileName = `certifications/${uid}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadImageAsync(file.uri, fileName);
      const updatedCerts = [...certifications, downloadURL];
      setCertifications(updatedCerts);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { certifications: updatedCerts });
    } catch (error) { console.error(error); } 
    finally { setUploading(false); }
  };

  // ✅ NEW: Delete Post Function
  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from Firestore
              await deleteDoc(doc(db, "posts", postId));
              // Note: The onSnapshot listener in useEffect will automatically update the list
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert("Error", "Failed to delete post. Please try again.");
            }
          }
        }
      ]
    );
  };

  const getAuthToken = async () => { try { return await auth.currentUser?.getIdToken(); } catch(e) { return undefined; }};
  
  const fetchFriends = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/user/friends/list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setFriends([]);
        return;
      }
      const data: FriendUser[] = await res.json();
      setFriends(data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/user/friends/requests`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setFriendRequests([]);
        return;
      }
      const data: FriendRequest[] = await res.json();
      setFriendRequests(data || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setFriendRequests([]);
    }
  };

  const handleSearchUsers = async () => {
    if (searchQuery.length < 2) return;
    try {
      const token = await getAuthToken();
      const q = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`${API_URL}/user/search?query=${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setSearchResults([]);
        return;
      }
      const data: UserLite[] = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/user/friends/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ receiverId }),
      });
      if (!res.ok) {
        Alert.alert("Error", "Could not send friend request.");
        return;
      }
      Alert.alert("Success", "Friend request sent!");
    } catch (err) {
      Alert.alert("Error", "Error sending friend request.");
    }
  };

  const acceptRequest = async (requesterId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/user/friends/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ requesterId }),
      });
      if (!res.ok) {
        Alert.alert("Error", "Could not accept request.");
        return;
      }
      await Promise.all([fetchFriendRequests(), fetchFriends()]);
    } catch (err) {
      Alert.alert("Error", "Error accepting request.");
    }
  };

  const rejectRequest = async (requesterId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/user/friends/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ requesterId }),
      });
      if (!res.ok) {
        Alert.alert("Error", "Could not reject request.");
        return;
      }
      await fetchFriendRequests();
    } catch (err) {
      Alert.alert("Error", "Error rejecting request.");
    }
  };

  useEffect(() => {
    if (activeTab === "friends") { fetchFriends(); fetchFriendRequests(); }
  }, [activeTab]);

  if (loadingUser) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#DDB771" /></View>;
  }

  const isOwnProfile = !userId || userId === auth.currentUser?.uid;
  const getProfilePicSource = (uri?: string) => uri ? { uri } : { uri: defaultProfileImage };

  return (
    <LinearGradient
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View>
          <Image source={getProfilePicSource(isEditing ? editedData.profile_picture : userData?.profile_picture)} style={styles.profileImage} />
          {isOwnProfile && isEditing && (
            <TouchableOpacity style={styles.uploadButton} onPress={async () => { }}>
              <Text style={styles.uploadText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        <View>
          <Text style={styles.name}>{userData?.first_name} {userData?.last_name}</Text>
          <View style={styles.verifiedRow}>
            <Image source={userData?.verification === "Approved" ? require("../assets/images/verified.png") : require("../assets/images/error.png")} style={styles.verifiedIcon} />
            <Text style={styles.verifiedText}>{userData?.verification === "Approved" ? "Verified" : "Not Verified"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.tabButtonsWrapper}>
        <View style={styles.tabButtonsRow}>
          <TouchableOpacity style={[styles.tabButton, activeTab === "posts" && styles.activeTab]} onPress={() => setActiveTab("posts")}>
            <Text style={styles.tabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === "details" && styles.activeTab]} onPress={() => setActiveTab("details")}>
            <Text style={styles.tabText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === "friends" && styles.activeTab]} onPress={() => setActiveTab("friends")}>
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
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
                ))}
            </View>

            <View style={styles.detailBox}>
                {isEditing ? <TextInput style={styles.input} value={editedData.first_name} onChangeText={(t) => setEditedData({...editedData, first_name: t})} placeholder="First Name"/> : <Text style={styles.details}>First Name: {userData?.first_name}</Text>}
            </View>
            <View style={styles.detailBox}>
                {isEditing ? <TextInput style={styles.input} value={editedData.last_name} onChangeText={(t) => setEditedData({...editedData, last_name: t})} placeholder="Last Name"/> : <Text style={styles.details}>Last Name: {userData?.last_name}</Text>}
            </View>
            
            <View style={styles.detailBox}><Text style={styles.details}>Email: {userData?.email}</Text></View>
            <View style={styles.detailBox}>
                {isEditing ? <TextInput style={styles.input} value={editedData.address} onChangeText={(t) => setEditedData({...editedData, address: t})} placeholder="Address"/> : <Text style={styles.details}>Address: {userData?.address || "Not specified"}</Text>}
            </View>

            <View style={styles.detailBox}><Text style={styles.details}>Role: {userData?.role}</Text></View>

            {userData?.role === "Farmer" && (
                <>
                    <View style={styles.detailBox}>
                        <Text style={styles.details}>Products Offered:</Text>
                        {userData?.farmer_details?.commodity?.length > 0 ? userData.farmer_details.commodity.map((c: any, i: number) => <Text key={i} style={styles.details}>• {typeof c === 'object' ? c.name : c}</Text>) : <Text style={styles.details}>Not specified</Text>}
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.details}>Mode of Delivery:</Text>
                        {userData?.farmer_details?.modeOfDelivery?.length > 0 ? userData.farmer_details.modeOfDelivery.map((id: string, i: number) => {
                            const m = deliveryModes.find(d => d.id === id); return <Text key={i} style={styles.details}>• {m ? m.name : id}</Text>
                        }) : <Text style={styles.details}>Not specified</Text>}
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.details}>Payment Terms:</Text>
                        {userData?.farmer_details?.paymentTerms?.length > 0 ? userData.farmer_details.paymentTerms.map((id: string, i: number) => {
                            const p = paymentList.find(pl => pl.id === id); return <Text key={i} style={styles.details}>• {p ? p.name : id}</Text>
                        }) : <Text style={styles.details}>Not specified</Text>}
                    </View>
                </>
            )}

            <View style={styles.detailBox}>
                <Text style={styles.detailsLabel}>Description:</Text>
                {isEditing ? 
                    <TextInput style={[styles.input, styles.textArea]} value={editedData.description} onChangeText={(t) => setEditedData({...editedData, description: t})} multiline placeholder="User Description..."/> 
                    : <Text style={styles.detailsValue}>{userData?.description || "No description."}</Text>
                }
            </View>

            {userData?.role === "Farmer" && (
                <View style={styles.detailBox}>
                    <Text style={styles.details}>Certifications:</Text>
                    {certifications.length > 0 ? (
                        <View style={styles.certGrid}>
                            {certifications.map((uri, i) => <TouchableOpacity key={i} onPress={() => setSelectedImage(uri)}><Image source={{ uri }} style={styles.certImage} /></TouchableOpacity>)}
                        </View>
                    ) : <Text style={styles.noCertifications}>No certifications.</Text>}
                    
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
            </View>

            {userPosts.length === 0 ? (
              <Text style={styles.noPosts}>No posts yet.</Text>
            ) : (
              <View style={styles.postGrid}>
                {userPosts.map((post) => (
                  <View key={post.id} style={styles.postWrapper}>
                    {post.mediaUrl ? (
                      <TouchableOpacity onPress={() => setSelectedImage(post.mediaUrl || "")}>
                        <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.postImage, { backgroundColor: '#fff', justifyContent: 'center', padding: 5 }]}>
                        <Text numberOfLines={3} style={{ fontSize: 10, color: '#333' }}>{post.content}</Text>
                      </View>
                    )}

                    {/* ✅ DELETE BUTTON */}
                    {isOwnProfile && (
                        <TouchableOpacity 
                            style={styles.deletePostButton}
                            onPress={() => handleDeletePost(post.id)}
                        >
                            <FontAwesome name="trash" size={14} color="#fff" />
                        </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* FRIEND REQUESTS */}
            <View style={{ marginTop: 10, marginBottom: 12 }}>
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

            {/* FRIENDS LIST */}
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

            {/* SEARCH USERS SECTION */}
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

      {selectedImage && (
        <Modal visible transparent onRequestClose={() => setSelectedImage(null)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity style={{ position: "absolute", top: 50, right: 20, zIndex: 1 }} onPress={() => setSelectedImage(null)}>
              <Text style={{ color: "#fff", fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={{ width: "90%", height: "70%", resizeMode: "contain" }} />
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { width: "100%", alignItems: "center", justifyContent: "center", position: "relative", paddingHorizontal: 20, marginBottom: 20 },
  title: { marginTop: 8, letterSpacing: 1, color: "#DDB771", fontFamily: theme.fonts.regular, fontSize: 20 },
  backButton: { position: "absolute", right: 20, top: 0, borderWidth: 2, borderColor: "#DDB771", borderRadius: 4, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { color: "#DDB771", fontSize: 24, fontWeight: "bold" },
  profileSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, gap: 16, marginBottom: 12 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: "#0B6E4F" },
  name: { fontSize: 20, fontFamily: "NovaSquare-Regular", color: "#DDB771" },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  verifiedIcon: { width: 16, height: 16 },
  verifiedText: { color: "#DDB771", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  divider: { width: "96%", height: 1, backgroundColor: "#DDB771", alignSelf: "center", marginVertical: 12 },
  detailsScroll: { paddingHorizontal: 20 },
  detailsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  detailsTitle: { color: "#DDB771", fontSize: 18, fontFamily: "NovaSquare-Regular" },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#DDB771", borderRadius: 8 },
  editText: { color: "#073B3A", fontFamily: "NovaSquare-Regular", fontSize: 14 },
  editButtonsRow: { flexDirection: "row", gap: 10 },
  cancelButton: { backgroundColor: "#DDB771", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-end", marginBottom: 8 },
  cancelText: { color: "#073B3A", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  saveButton: { backgroundColor: "#DDB771", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-end", marginBottom: 8 },
  saveText: { color: "#073B3A", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  detailBox: { backgroundColor: "#F5F5F5", borderRadius: 12, padding: 12, marginBottom: 12, elevation: 4 },
  details: { fontSize: 14, color: "#08A045", fontFamily: "NovaSquare-Regular" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#073B3A" },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  uploadButton: { backgroundColor: "#DDB771", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 12 },
  uploadText: { color: "#073B3A", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  noPosts: { color: "#fff", fontFamily: "NovaSquare-Regular", fontSize: 14 },
  tabButtonsWrapper: { width: "96%", alignSelf: "center", marginBottom: 10 },
  tabButtonsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 10, gap: 10 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: "#0B6E4F", alignItems: "center" },
  activeTab: { backgroundColor: "#DDB771" },
  tabText: { color: "#FFFFFF", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  postGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  postWrapper: { position: 'relative' }, // ✅ Container for relative positioning
  postImage: { width: 100, height: 100, borderRadius: 8, backgroundColor: "#eee" },
  deletePostButton: { // ✅ Style for delete button
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  certGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 10 },
  certImage: { width: 100, height: 100, borderRadius: 8, backgroundColor: "#ccc" },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#08A045" },
  dropdownText: { color: "#08A045", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  selectedRoleButton: { backgroundColor: "#08A045" },
  selectedRoleText: { fontSize: 14, color: "#fff", fontFamily: "NovaSquare-Regular" },
  textArea: { height: 100, paddingTop: 10, textAlignVertical: "top" },
  detailsLabel: { fontSize: 14, color: "#08A045", fontFamily: "NovaSquare-Regular", marginBottom: 4 },
  detailsValue: { fontSize: 14, color: "#333", fontFamily: "NovaSquare-Regular", lineHeight: 20 },
  friendRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", padding: 10, borderRadius: 10, marginBottom: 8, gap: 10 },
  friendAvatar: { width: 45, height: 45, borderRadius: 30, backgroundColor: "#ddd" },
  friendName: { color: "#073B3A", fontSize: 15, flex: 1, fontFamily: "NovaSquare-Regular" },
  acceptButton: { backgroundColor: "#08A045", padding: 8, borderRadius: 8, marginRight: 6 },
  rejectButton: { backgroundColor: "#b13333", padding: 8, borderRadius: 8 },
  acceptText: { color: "#fff" },
  rejectText: { color: "#fff" },
  addButton: { backgroundColor: "#DDB771", padding: 8, borderRadius: 8 },
  addText: { color: "#073B3A" },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, color: "#073B3A", fontSize: 14, fontFamily: "NovaSquare-Regular" },
  noCertifications: { color: "#ccc", fontFamily: "NovaSquare-Regular", fontSize: 14 },
});

export default ProfilePage;