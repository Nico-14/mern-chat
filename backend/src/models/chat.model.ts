import { model, Schema, Document, Types } from 'mongoose';
import { MessageDocument } from './message.model';
import { UserDocument } from './user.model';

export interface ChatDocument extends Document {
  participants: Types.Array<Types.ObjectId> | Types.Array<UserDocument>;
  messages: Types.Array<Types.ObjectId> | Types.Array<MessageDocument>;
}

const chatSchema = new Schema({
  participants: [{ type: Types.ObjectId, ref: 'User' }],
  messages: [{ type: Types.ObjectId, ref: 'Message' }],
});

chatSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: any, ret: any) => {
    delete ret._id;
  },
});

export default model<ChatDocument>('Chat', chatSchema);
