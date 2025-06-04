import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// DraggableFlatList と関連コンポーネントをインポート
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 追加
import Animated, {
  FadeIn, // FadeIn, FadeOut はアイテム追加・削除時のアニメーションに使える
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  order: number;
}

const STORAGE_KEY = "todos";
// const ITEM_HEIGHT = 80; // DraggableFlatListでは必須ではない

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // const [isDragging, setIsDragging] = useState(false); // DraggableFlatListが内部管理
  const insets = useSafeAreaInsets();

  // Load todos from storage
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos: Todo[] = JSON.parse(storedTodos);
        const todosWithOrder = parsedTodos.map((todo, index) => ({
          ...todo,
          order: todo.order !== undefined ? todo.order : index,
        }));
        todosWithOrder.sort((a, b) => a.order - b.order);
        setTodos(todosWithOrder);
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      // 保存前に order でソートすることを保証
      const sortedTodos = [...newTodos].sort((a, b) => a.order - b.order);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortedTodos));
    } catch (error) {
      console.error("Failed to save todos:", error);
    }
  };

  const addTodo = () => {
    if (inputText.trim().length === 0) return;
    if (inputText.length > 100) {
      Alert.alert("エラー", "文字数は100文字までです");
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now(),
      order: 0, // 新しいタスクを最上位に
    };

    const updatedTodos = todos.map((todo) => ({
      ...todo,
      order: todo.order + 1,
    }));

    const newTodos = [newTodo, ...updatedTodos];
    setTodos(newTodos);
    saveTodos(newTodos);
    setInputText("");
    setIsModalVisible(false);
  };

  const deleteTodo = (id: string) => {
    Alert.alert("タスクを削除", "このタスクを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          const newTodos = todos.filter((todo) => todo.id !== id);
          const reorderedTodos = newTodos.map((todo, index) => ({
            ...todo,
            order: index,
          }));
          setTodos(reorderedTodos);
          saveTodos(reorderedTodos);
        },
      },
    ]);
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(newTodos);
    saveTodos(newTodos); // orderは変わらないのでそのまま保存
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const saveEdit = () => {
    if (editingText.trim().length === 0) return;
    if (editingText.length > 100) {
      Alert.alert("エラー", "文字数は100文字までです");
      return;
    }

    const newTodos = todos.map((todo) =>
      todo.id === editingId ? { ...todo, text: editingText.trim() } : todo,
    );
    setTodos(newTodos);
    saveTodos(newTodos); // orderは変わらないのでそのまま保存
    setEditingId(null);
    setEditingText("");
    setIsEditMode(false);
    setIsModalVisible(false);
  };

  // DraggableFlatList の renderItem
  const renderTodoItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Todo>) => {
      const truncateText = (text: string) => {
        const lines = text.split("\n");
        if (lines.length > 2) {
          return lines.slice(0, 2).join("\n") + "...";
        }
        if (text.length > 80) {
          return text.substring(0, 80) + "...";
        }
        return text;
      };

      return (
        // ScaleDecorator はドラッグ中にアイテムを少し拡大するなどの効果を提供
        <ScaleDecorator>
          <Animated.View
            entering={FadeIn} // アイテム追加時のアニメーション
            exiting={FadeOut} // アイtem削除時のアニメーション
            style={[
              styles.todoItem,
              isActive && styles.todoItemDragging, // ドラッグ中のスタイル
            ]}>
            <TouchableOpacity
              onLongPress={drag} // この要素を長押しでドラッグ開始
              disabled={isActive} // ドラッグ中は他の操作を無効化
              style={styles.dragHandle}>
              <Ionicons name="reorder-three" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkbox} onPress={() => toggleTodo(item.id)}>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? "#4CAF50" : "#E0E0E0"}
              />
            </TouchableOpacity>

            <View style={styles.todoContent}>
              <Text
                style={[styles.todoText, item.completed && styles.completedText]}
                numberOfLines={2}>
                {truncateText(item.text)}
              </Text>
            </View>

            <View style={styles.todoActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEdit(item.id, item.text)}>
                <Ionicons name="pencil" size={18} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => deleteTodo(item.id)}>
                <Ionicons name="trash" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScaleDecorator>
      );
    },
    [toggleTodo, startEdit, deleteTodo], // 依存配列
  );

  const onDragEnd = ({ data: newSortedData }: { data: Todo[] }) => {
    // DraggableFlatListから渡されるデータは既に並び替えられている
    // その順序に基づいてorderプロパティを更新する
    const reorderedTodos = newSortedData.map((todo, index) => ({
      ...todo,
      order: index,
    }));
    setTodos(reorderedTodos);
    saveTodos(reorderedTodos);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setInputText("");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setInputText("");
    setEditingText("");
    setEditingId(null);
    setIsEditMode(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>マイタスク</Text>
          <Text style={styles.subtitle}>{todos.filter((t) => !t.completed).length} 件のタスク</Text>
          {todos.length > 1 && <Text style={styles.dragHint}>≡ を長押しして並び替え</Text>}
        </View>

        {/* Todo List */}
        <View style={styles.list}>
          {todos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>タスクがありません</Text>
              <Text style={styles.emptySubtext}>新しいタスクを追加してみましょう</Text>
            </View>
          ) : (
            <DraggableFlatList
              data={todos}
              renderItem={renderTodoItem}
              keyExtractor={(item) => item.id}
              onDragEnd={onDragEnd}
              containerStyle={{ flex: 1 }} // DraggableFlatListがリスト領域を埋めるように
              contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
              // scrollEnabled は DraggableFlatList が内部で管理
            />
          )}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: 100 + insets.bottom, // 元のコードでは70でしたが、UIに合わせて調整してください
            },
          ]}
          onPress={openAddModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>

        {/* Add/Edit Modal */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={() => {}}>
                  <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={[
                      styles.modalContent,
                      {
                        paddingBottom: Math.max(24, insets.bottom),
                      },
                    ]}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {isEditMode ? "タスクを編集" : "新しいタスク"}
                      </Text>
                      <TouchableOpacity onPress={closeModal}>
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="タスクを入力してください..."
                      value={isEditMode ? editingText : inputText}
                      onChangeText={isEditMode ? setEditingText : setInputText}
                      multiline
                      maxLength={100}
                      autoFocus
                    />

                    <Text style={styles.charCount}>
                      {(isEditMode ? editingText : inputText).length}/100
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        (isEditMode ? editingText.trim() : inputText.trim()).length === 0 &&
                          styles.saveButtonDisabled,
                      ]}
                      onPress={isEditMode ? saveEdit : addTodo}
                      disabled={(isEditMode ? editingText.trim() : inputText.trim()).length === 0}>
                      <Text style={styles.saveButtonText}>{isEditMode ? "保存" : "追加"}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  dragHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  list: {
    flex: 1,
  },
  // scrollView: { // DraggableFlatListがこれを担当
  //   flex: 1,
  // },
  listContent: {
    paddingHorizontal: 16, // 左右のパディング
    paddingTop: 16, // 上のパディング
    // paddingBottom は DraggableFlatList の contentContainerStyle で動的に設定
  },
  todoItem: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12, //少し調整
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70, // 元のITEM_HEIGHTに近い値に設定 (調整可能)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1, // 少し控えめに
    },
    shadowOpacity: 0.08, // 少し控えめに
    shadowRadius: 4, // 少し控えめに
    elevation: 2,
  },
  todoItemDragging: {
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    // backgroundColor: '#FAFAFA', // ドラッグ中に背景色を変える例
  },
  dragHandle: {
    paddingRight: 12, // アイコンとテキスト間のスペース
    paddingLeft: 0, // 左端に寄せる
    paddingVertical: 8, // タッチエリアを確保
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24, // 左右のパディング
    paddingTop: 24, // 上のパディング
    // paddingBottom は動的に設定
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#F8F9FA",
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 4,
  },
});
