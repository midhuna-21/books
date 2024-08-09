import  mongoose,{ Schema, model, Document } from 'mongoose';

interface IChatRoom extends Document {
  userId?: string;
  receiverId?: string;
}

const chatRoomSchema = new Schema<IChatRoom>({
   userId: { type: String, ref:"user" },
   receiverId: { type: String, ref:"user"}
});

const chatRoom = mongoose.model<IChatRoom>("chatRoom",chatRoomSchema)
export {chatRoom,IChatRoom}
