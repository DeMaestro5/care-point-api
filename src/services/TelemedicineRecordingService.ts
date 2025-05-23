import { Types } from 'mongoose';
import TelemedicineSessionRepo from '../database/repository/TelemedicineSessionRepo';
import { BadRequestError } from '../core/ApiError';

class TelemedicineRecordingService {
  async toggleRecording(
    sessionId: Types.ObjectId,
    isRecording: boolean,
  ): Promise<{ isRecording: boolean; recordingUrl?: string }> {
    const session = await TelemedicineSessionRepo.findById(sessionId);
    if (!session) {
      throw new BadRequestError('Telemedicine session not found');
    }

    if (session.status !== 'in-progress') {
      throw new BadRequestError(
        'Recording can only be toggled during an active session',
      );
    }

    try {
      // TODO: Implement actual recording service integration here
      // This could be using a service like Twilio, Agora, etc.
      // For now, we'll just update the database state

      const updatedSession = await TelemedicineSessionRepo.update(sessionId, {
        isRecording,
        // If stopping recording, you would typically get a recordingUrl from the service
        recordingUrl: !isRecording
          ? 'https://example.com/recording.mp4'
          : undefined,
      });

      if (!updatedSession) {
        throw new BadRequestError('Failed to update recording status');
      }

      return {
        isRecording: updatedSession.isRecording,
        recordingUrl: updatedSession.recordingUrl,
      };
    } catch (error) {
      throw new BadRequestError(
        'Failed to toggle recording: ' + (error as Error).message,
      );
    }
  }
}

export default new TelemedicineRecordingService();
