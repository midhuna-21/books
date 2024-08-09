import  mongoose,{ Schema, model, Document } from 'mongoose';

interface IMessage extends Document {
  chatRoomId: Schema.Types.ObjectId;
  sender: string;
  content: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'chatRoom', required: true },
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chat = mongoose.model<IMessage>("message",messageSchema)
export {chat,IMessage}
