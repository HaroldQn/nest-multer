import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
process.loadEnvFile();
@Injectable()
export class AppService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const KEY_IA = process.env.KEY_IA as string;

    if (!KEY_IA) {
      console.error('No se encontró la clave de API de Gemini IA');
      return;
    }

    this.genAI = new GoogleGenerativeAI(KEY_IA);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async geminIA_api(text: string, question: string) {
    if (!this.model) {
      throw new BadRequestException('No se puede procesar la solicitud porque la clave de API no está configurada.');
    }

    const prompt = `
      Analiza el siguiente texto y responde a la pregunta basada en su contenido:

      Texto:
      """
      ${text}
      """

      Pregunta:
      "${question}"

      Proporciona una respuesta clara y concisa basada únicamente en el contenido del texto.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No se obtuvo respuesta";
      return responseText;
    } catch (error) {
      console.error('Error al generar contenido con Gemini IA:', error);
      throw new BadRequestException('Hubo un error al comunicarse con la API de Gemini IA.');
    }
  }
}
