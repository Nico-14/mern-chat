import { model, Schema, Document, Types } from 'mongoose';
import { UserDocument } from './user.model';

export interface MessageDocument extends Document {
  from: Types.ObjectId | UserDocument;
  to: Types.ObjectId | UserDocument;
  content: string;
  date: Date;
}

const messageSchema = new Schema({
  from: { type: Types.ObjectId, ref: 'User' },
  to: { type: Types.ObjectId, ref: 'User' },
  content: String,
  date: Date,
});

messageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: any, ret: any) => {
    delete ret._id;
  },
});

export default model<MessageDocument>('Message', messageSchema);
