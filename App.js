import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicatorBase,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@todos";

const App = () => {
  const [working, setWorking] = React.useState(true);
  const [text, setText] = React.useState("");
  const [todos, setTodos] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const onChangeText = (payload) => setText(payload);
  const travel = () => setWorking(true);
  const work = () => setWorking(false);

  const onSaveTodos = async (toSave) => {
    // 1. 현재의 todos를 string으로 변환
    // 2. await AsyncStorage.setItem 을 해줌
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadTodos = async () => {
    setLoading(true);
    try {
      const result = await AsyncStorage.getItem(STORAGE_KEY);
      // 휴대폰 디스크에 있던 string 받아서
      console.log(result, JSON.parse(result));
      result !== null ? setTodos(JSON.parse(result)) : null;
      // javascript object로 변환해서 state에 전달 => render => UI update
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const deleteTodo = async (key) => {
    Alert.alert("Delete Todo", "Are you sure?", [
      { text: "cancel" },
      {
        text: "delete",
        style: "destructive",
        onPress: async () => {
          // 1. 현재 있던 todos의 요소를 받아서 새로운 객체를 만든다
          const newTodos = { ...todos };

          delete newTodos[key];
          // 그 객체에서 받아온 key를 찾아서 지움
          // 이 object는 아직 state에 있지 않기 때문에 mutate해도 됨. state는 절대 mutate하면 안됨!

          setTodos(newTodos);
          // 화면에 보일 todos를 업데이트해주고

          await onSaveTodos(newTodos);
          // async storage에 저장한다
        },
      },
    ]);
  };

  React.useEffect(() => {
    loadTodos();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // 1. spread operator로 불변성 유지
    const newTodos = {
      ...todos,
      [Date.now()]: { text, working },
      // key를 통해 todo를 찾기 위해서
    };

    // 2. Object.assign으로 불변성 유지
    // const newTodos = Object.assign({}, todos, {
    //   [Date.now()]: { text: text, work: working },
    // });
    await setTodos(newTodos);
    // 3. async storage에 저장하기 위한 onSaveTodos가 받는 toSave는 addToDo를 통해서 onSaveTodos에 전해짐
    onSaveTodos(newTodos);
    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
      />
      {/*  Object.keys() : object key들의 배열을 반환함.
        Object.keys(todos) : todos의 key들을 얻을 수 있음
        todos에 접근해서, 그 안에 들어있는 각 key들의 값에 접근하고,
        각 key들의 값안에 있는 working의 값이 상태값 working과 같은지 비교함
        그럼 todos 배열의 key값으로 각 id를 넣으면, 그 id로 todos에서 값을 찾을 수 있음
      */}
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        {loading ? (
          <ActivityIndicator color="white" size={"large"} style={{ flex: 1 }} />
        ) : (
          Object.keys(todos).map((key) =>
            todos[key]?.working === working ? (
              <View key={key} style={styles.toDo}>
                <Text style={styles.toDoText}>{todos[key]?.text}</Text>
                <TouchableOpacity onPress={() => deleteTodo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            ) : null
          )
          // <></>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.todoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default App;

// 1. tab 위치 기억
// 2. complete 값 추가해서 중앙선 긋기
// 3. 수정가능
