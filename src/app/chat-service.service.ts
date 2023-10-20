import { Injectable, inject } from '@angular/core';
import { Thread } from 'src/models/thread.class';
import { DocumentData, DocumentReference, Firestore, collection, getDocs, query } from '@angular/fire/firestore';
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  firestore: Firestore = inject(Firestore);
  private storage = getStorage();
  userCollection = collection(this.firestore, 'users');
  channelCollection = collection(this.firestore, 'channels');

  serviceThread: Thread = new Thread();
  ownerData: Thread = new Thread();
  isContent: boolean = false;
  isEditMessageContent: boolean = false;

  currentImageUrl: string = '';
  uploadedFileChat: string = '';
  uploadedFileThreads: string = '';
  uploadedFileDm: string = '';

  projectImages: string[] = [];
  fileNames: string[] = [];
  result: string[] = [];

  uploading: boolean = false;
  uploadingInAnswer: boolean = false;
  showImage: boolean = false;
  cleaningDataInProgress: boolean = false;


  /**
   * Resets the preview URLs for all image types.
   */
  resetPreviews() {
    this.uploadedFileChat = '';
    this.uploadedFileThreads = '';
    this.uploadedFileDm = '';
  }


  /**
   * Resets the value of all input elements.
   */
  resetInputs() {
    const inputIds = ['fileInputChat', 'fileInputThread', 'fileInputDm'];
    inputIds.forEach(id => {
      const inputElement = document.getElementById(id) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    });
  }


  /**
   * Saves the current image URL to the appropriate property based on the input ID.
   * @param {string} inputId - ID of the input element that triggered the upload.
   */
  saveUrl(inputId: string) {
    if (inputId === 'fileInputChat') {
      this.uploadedFileChat = this.currentImageUrl;
    }
    if (inputId === 'fileInputThread') {
      this.uploadedFileThreads = this.currentImageUrl;
    }
    if (inputId === 'fileInputDm') {
      this.uploadedFileDm = this.currentImageUrl;
    }
  }


  /**
   * Handles the core uploading process: uploading the file and getting the download URL.
   * @param {File} file - The file to be uploaded.
   */
  private async handleUploadProcess(file: File): Promise<string> {
    const filePath = `${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    const snapshot = await uploadTask;
    return getDownloadURL(snapshot.ref);
  }


  /**
  * Handles the process of uploading an image.
  * @param {any} event - Event triggered by the file input change.
  * @param {string} inputId - ID of the input element that triggered the upload.
  */
  async uploadImage(event: any, inputId: string) {
    try {
      this.resetPreviews();

      const file = event.target.files[0];
      this.currentImageUrl = await this.handleUploadProcess(file);

      this.saveUrl(inputId);
      this.resetInputs();
    } catch (error) {
      console.error('Error uploading image', error);
    }
  }


  /**
   * Handles the image upload process for threads.
   * @param {any} event - Event triggered by the file input change.
   * @param {string} inputId - ID of the input element that triggered the upload.
   */
  async uploadImageInThreads(event: any, inputId: string) {
    this.uploading = true;
    await this.uploadImage(event, inputId);
    this.uploading = false;
  }


  /**
   * Handles the image upload process for answers.
   * @param {any} event - Event triggered by the file input change.
   * @param {string} inputId - ID of the input element that triggered the upload.
   */
  async uploadImageInAnswers(event: any, inputId: string) {
    this.uploadingInAnswer = true;
    await this.uploadImage(event, inputId);
    this.uploadingInAnswer = false;
  }


  /**
   * Deletes the preview image and hides the image for a set duration.
   */
  async deletePreviewImage() {
    this.showImage = true;
    this.resetPreviews();
    setTimeout(() => {
      this.showImage = false;
    }, 1000);
  }



  /**
    * Cleans up storage by comparing project images with files in storage 
    * and deleting any extraneous files.
    */
  async cleanupStorage() {
    this.result = [];
    this.fileNames = [];
    try {
      const storageRef = ref(this.storage);
      const result = await listAll(storageRef);
      this.fileNames = result.items.map((item) => item.name);
      await this.getProjectImages();
      this.compareArrays(this.fileNames, this.projectImages);
      await this.deleteFilesFromStorage(this.result);
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * Deletes files from storage based on provided filenames.
   * @param {string[]} result - Array of filenames to be deleted.
   */
  async deleteFilesFromStorage(result: string[]) {
    try {
      const storageRef = ref(this.storage);
      for (const fileName of result) {
        const fileRef = ref(storageRef, fileName);
        await deleteObject(fileRef);
      }
    } catch {}
  }


  /**
   * Compares two arrays and updates the result with filenames not present in projectImages.
   * @param {string[]} fileNames - Array of filenames from storage.
   * @param {string[]} projectImages - Array of filenames used in the project.
   */
  compareArrays(fileNames: string[], projectImages: string[]) {
    this.result = fileNames.filter(fileName => !projectImages.includes(fileName));
  }


  /**
   * Extracts the filename from a URL.
   * @param {string} url - The full URL of the file.
   */
  splitUrltoFileName(url: string): string {
    const decodedUrl = decodeURIComponent(url);
    const urlParts = decodedUrl.split('/');
    const fileNameWithQueryParams = urlParts[urlParts.length - 1];
    const parts = fileNameWithQueryParams.split('?');
    return parts[0];
  }


  /**
   * Gathers all images associated with various project collections.
   */
  async getProjectImages() {
    this.projectImages = [];
    await this.getChannelsImages();
    await this.getUsersImages();
    await this.getDMThreadsImages();
  }


  /**
   * Extracts and pushes an image filename into the projectImages array.
   * @param {string} uploadedFile - The full URL of the uploaded file.
   */
  extractAndPushImage(uploadedFile: string): void {
    if (uploadedFile) {
      const fileName = this.splitUrltoFileName(uploadedFile);
      this.projectImages.push(fileName);
    }
  }


  /**
   * Extracts the image from the provided document data and pushes the image's filename 
   * into the `projectImages` array.
   * @param {DocumentData} data - The Firestore document data.
   */
  async getImagesFromDocument(data: DocumentData): Promise<void> {
    this.extractAndPushImage(data['uploadedFile']);
  }


  /**
   * Extracts the avatar image from the provided document data and pushes the image's filename 
   * into the `projectImages` array.
   * @param {DocumentData} data - The Firestore document data.
   */
  async getAvatarImagesFromDocument(data: DocumentData): Promise<void> {
    this.extractAndPushImage(data['avatarSrc']);
  }


  /**
   * Traverses through a sub-collection of a Firestore document to gather all image data.
   * If the sub-collection path is `threads`, it recursively traverses its `answers` sub-collection.
   * @param {DocumentReference} docRef - Reference to the parent document.
   * @param {string} subCollectionPath - The path of the sub-collection to traverse.
   */
  async traverseSubCollection(docRef: DocumentReference, subCollectionPath: string): Promise<void> {
    const subCollection = collection(docRef, subCollectionPath);
    const subQuerySnapshot = await getDocs(query(subCollection));

    for (const subDoc of subQuerySnapshot.docs) {
      await this.getImagesFromDocument(subDoc.data());

      if (subCollectionPath === 'threads') {
        await this.traverseSubCollection(subDoc.ref, 'answers');
      }
    }
  }


  /**
   * Retrieves all images associated with direct message threads and their answers.
   */
  async getDMThreadsImages() {
    const dMCollection = collection(this.firestore, 'direct-messages');
    const dMQuerySnapshot = await getDocs(query(dMCollection));
    for (const dMDoc of dMQuerySnapshot.docs) {
      await this.traverseSubCollection(dMDoc.ref, 'threads');
    }
  }


  /**
   * Retrieves all avatar images associated with users and any images from their self-messages.
   * Also, it traverses through the 'threads' sub-collection for each self-message if they exist.
   */
  async getUsersImages() {
    const usersCollection = collection(this.firestore, 'users');
    const usersQuerySnapshot = await getDocs(query(usersCollection));

    for (const userDoc of usersQuerySnapshot.docs) {
      this.getAvatarImagesFromDocument(userDoc.data());

      const selfMessagesSubCollection = collection(userDoc.ref, 'self-messages');
      const selfMessagesQuerySnapshot = await getDocs(query(selfMessagesSubCollection));

      for (const selfMessageDoc of selfMessagesQuerySnapshot.docs) {
        await this.getImagesFromDocument(selfMessageDoc.data());
      }
    }
  }


  /**
   * Retrieves all images associated with channels and their threads.
   */
  async getChannelsImages() {
    const channelsCollection = collection(this.firestore, 'channels');
    const channelsQuerySnapshot = await getDocs(query(channelsCollection));

    for (const channelDoc of channelsQuerySnapshot.docs) {
      await this.traverseSubCollection(channelDoc.ref, 'threads');
    }
  }
}