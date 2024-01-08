import styled from "styled-components";
import { ITweet } from "./timeline";
import { useEffect, useRef, useState } from "react";
import { Error } from "./auth-components";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

const Wrapper = styled.dialog`
  padding: 0px;
  border-radius: 15px;
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;
const Form = styled.form`
  background-color: black;
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;
const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const PhotoArea = styled.div`
  display: flex;
`;

const ChangePhoto = styled.label`
  display: flex;
  flex-direction: row;
  width: 100px;
  height: 100px;
  svg {
    width: 30px;
    fill: white;
  }
`;
const PreviewPhoto = styled.img`
  cursor: pointer;
  border-radius: 15px;
  width: 80px;
  height: 100%;
  &:hover {
    filter: contrast(0.5);
  }
`;
const DummyPhoto = styled.div`
  background-color: grey;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 15px;
  width: 80px;
  height: 100px;
  &:hover {
    filter: contrast(0.5);
  }
`;

const PanelPhoto = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;
const ResetPhoto = styled.div`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;
const DeletePhoto = styled.div`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;
const SubmitButton = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;
const CancelButton = styled.input`
  padding: 10px 0px;
  background-color: black;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

export interface IEditTweet {
  onClose: () => void;
  tweet: ITweet;
}

export default function EditTweetDialog({ onClose, tweet }: IEditTweet) {
  const [newTweet, setNewTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [deleteFile, setDeleteFile] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const onChangeTweet = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTweet(e.target.value);
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || newTweet === "" || newTweet.length > 180) {
      return;
    }
    try {
      setLoading(true);

      let diff = {};
      if (newTweet !== tweet.tweet) {
        diff = { tweet: newTweet, ...diff };
      }
      if (deleteFile && tweet.photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${tweet.id}`);
        await deleteObject(photoRef);
        diff = { photo: null, ...diff };
      } else if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${tweet.id}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        diff = { photo: url, ...diff };
      }
      if (Object.keys(diff).length > 0) {
        await updateDoc(doc(db, "tweets", tweet.id), diff);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      onClose();
    }
  };
  const onCancel = () => {
    onClose();
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("--");
    setFileError("");
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }
    if (files.length > 1) {
      setFileError("Too many files.");
      return;
    }
    if (files[0].size > 1048576) {
      setFileError("File size too big (Max 1MB)");
      return;
    }
    setDeleteFile(false);
    setFile(files[0]);
  };
  const onResetPhoto = () => {
    setDeleteFile(false);
    setFileError("");
    setFile(null);
  };
  const onDeletePhoto = () => {
    setDeleteFile(true);
    setFileError("");
    setFile(null);
  };

  useEffect(() => {
    setNewTweet(tweet.tweet);
    dialogRef.current?.showModal();
  }, []);
  const previewSrc = deleteFile
    ? null
    : file
    ? URL.createObjectURL(file)
    : tweet.photo;

  return (
    <Wrapper ref={dialogRef}>
      <Form onSubmit={onSubmit}>
        <TextArea required onChange={onChangeTweet} value={newTweet} />
        <>
          <PhotoArea>
            <ChangePhoto htmlFor="dialogFile">
              {previewSrc ? (
                <PreviewPhoto src={previewSrc} />
              ) : (
                <DummyPhoto>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    ></path>
                  </svg>
                </DummyPhoto>
              )}
            </ChangePhoto>
            {isLoading ? null : (
              <>
                <PanelPhoto>
                  <ResetPhoto onClick={onResetPhoto}>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        clip-rule="evenodd"
                        fill-rule="evenodd"
                        d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                      ></path>
                    </svg>
                  </ResetPhoto>
                  <DeletePhoto onClick={onDeletePhoto}>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path>
                    </svg>
                  </DeletePhoto>
                </PanelPhoto>
                <AttachFileInput
                  onChange={onFileChange}
                  type="file"
                  id="dialogFile"
                  accept="image/*"
                />
              </>
            )}
          </PhotoArea>
        </>
        <SubmitButton
          type="submit"
          value={isLoading ? "Loading.." : "Edit Tweet"}
        />
        {isLoading ? null : (
          <CancelButton type="button" onClick={onCancel} value="Cancel" />
        )}
        {fileError !== "" ? <Error>{fileError}</Error> : null}
      </Form>
    </Wrapper>
  );
}
