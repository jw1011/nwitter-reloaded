import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { User, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

interface EditPropsInterface {
  user: User | null;
  onClose: () => any;
}

const ModalBackdrop = styled.div`
  z-index: 1; //위치지정 요소
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ModalView = styled.div.attrs(() => ({
  role: "dialog",
}))`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  width: 300px;
  height: 200px;
  background-color: #ffffff;
  align-items: flex-start;
  > div.desc {
    margin: 50px;
    font-size: 20px;
    color: var(--coz-purple-600);
  }
`;

const Text = styled.input`
  border: 2px solid white;
  padding: 10px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  resize: none;
  width: 270px;
  &::placeholder {
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const ExitBtn = styled.button`
  background-color: #949a99;
  border-radius: 10px;
  margin: 10px 10px;
  padding: 5px 10px;
  width: 80px;
  height: 30px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  text-transform: uppercase;
`;

const SaveBtn = styled.button`
  background-color: #33a5ff;
  border-radius: 10px;
  margin: 10px 10px;
  padding: 5px 10px;
  width: 80px;
  height: 30px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  text-transform: uppercase;
`;

function EditProfile({ user, onClose }: EditPropsInterface) {
  const [newName, setNewName] = useState<string | null | undefined>("");

  const updateTweets = async () => {
    const tweetQuery = await query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid)
    );
    const snapshot = await getDocs(tweetQuery);
    snapshot.docs.forEach(async (data) => {
      const { tweet, createdAt, userId, photo } = data.data();
      const newDoc = {
        id: data.id,
        tweet,
        createdAt,
        userId,
        userName: user?.displayName,
        photo,
      };
      await updateDoc(doc(db, "tweets", data.id), { ...newDoc });
    });
  };

  const onSave = async () => {
    try {
      if (!user) return;
      await updateProfile(user, {
        displayName: newName,
      });
      await updateTweets();
    } catch (e) {
      console.log(e);
    } finally {
      onClose();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  useEffect(() => {
    setNewName(user?.displayName);
  }, []);

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalView onClick={(e) => e.stopPropagation()}>
        <Text
          type="text"
          maxLength={20}
          value={newName ?? ""}
          onChange={onChange}
        />
        <ButtonGroup>
          <ExitBtn onClick={onClose}>Cancel</ExitBtn>
          <SaveBtn onClick={onSave}>Save</SaveBtn>
        </ButtonGroup>
      </ModalView>
    </ModalBackdrop>
  );
}

export default EditProfile;
