import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { filesAPI, StudyFile, aiAPI } from '../../utils/api';

export function DocumentReader() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [file, setFile] = useState<StudyFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showDefinition, setShowDefinition] = useState(false);
  const [definition, setDefinition] = useState('');
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  useEffect(() => {
    // Handle text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && text.length < 100) {
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      // Stop TTS when component unmounts
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadFile = async () => {
    if (!fileId) return;

    setIsLoading(true);
    try {
      // Get file metadata
      const { url } = await filesAPI.getDownloadUrl(fileId);

      // In a real app, you would fetch and parse the actual file content
      // For this demo, we'll use mock content
      const mockText = `
# ${file?.fileName || 'Documento de Estudio'}

Este es un documento de estudio de ${user?.career || 'tu carrera'}.

## Introducción

La anatomía es la ciencia que estudia la estructura de los seres vivos, es decir, la forma, topografía,
la ubicación, la disposición y la relación entre sí de los órganos que las componen.

El término anatomía proviene del griego ἀνατομή (anatomḗ), que significa "disección" o "cortar a través de".

## Términos Importantes

**Homeostasis**: Es el conjunto de fenómenos de autorregulación que intentan mantener equilibradas
las composiciones y las propiedades del organismo.

**Fisiología**: Es la ciencia biológica que estudia las funciones de los seres vivos.
Esta forma de estudio reúne los principios de las ciencias exactas, dando sentido a aquellas
interacciones de los elementos básicos de un ser vivo con su entorno.

**Metabolismo**: Conjunto de reacciones químicas que tienen lugar en las células del cuerpo.
El metabolismo transforma la energía de los alimentos en la energía necesaria para todo lo que hacemos.

## Aplicaciones Clínicas

El conocimiento de la anatomía es fundamental para la práctica médica. Permite comprender
la ubicación exacta de estructuras anatómicas para procedimientos quirúrgicos y diagnósticos.

La anatomía se divide en varias ramas, incluyendo la anatomía macroscópica (visible a simple vista)
y la anatomía microscópica (requiere microscopio).
      `.trim();

      setDocumentText(mockText);

      // Load file data separately
      const allFiles = await filesAPI.getAll(user?.userId || '');
      const currentFile = allFiles.find((f) => f.id === fileId);
      if (currentFile) {
        setFile(currentFile);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Error al cargar el documento');
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDefinition = async () => {
    if (!selectedText || !user) return;

    setIsLoadingDefinition(true);
    setShowDefinition(true);

    try {
      const result = await aiAPI.getDefinition(
        selectedText,
        documentText.slice(0, 1000), // Send context
        user.career
      );

      setDefinition(result.definition);
    } catch (error) {
      console.error('Error getting definition:', error);
      setDefinition('Error al obtener definición. Verifica tu API key de OpenAI.');
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  // TTS Functions
  const startReading = () => {
    if (!documentText) return;

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(documentText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      toast.error('Error en la lectura de voz');
    };

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  const toggleReading = () => {
    if (!isSpeaking) {
      startReading();
    } else if (isPaused) {
      resumeReading();
    } else {
      pauseReading();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="px-4 py-6 max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/library">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Biblioteca</span>
              </Link>
            </Button>
            <div className="flex-1 text-center min-w-0">
              <h1 className="text-sm font-semibold text-slate-900 truncate">
                {file?.fileName || 'Documento'}
              </h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* TTS Controls */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-600" />
                Lectura Asistida por IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopReading}
                  disabled={!isSpeaking}
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  onClick={toggleReading}
                  className="gap-2"
                >
                  {!isSpeaking ? (
                    <>
                      <Play className="h-5 w-5" />
                      Leer en Voz Alta
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="h-5 w-5" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5" />
                      Pausar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-center text-slate-600 mt-3">
                La lectura continúa incluso con la pantalla apagada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* AI Assistant Hint */}
        {selectedText && (
          <div className="mb-4 sticky top-28 z-10">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Texto seleccionado: "{selectedText.slice(0, 30)}..."
                    </p>
                    <Button size="sm" onClick={handleGetDefinition} className="gap-2">
                      <Sparkles className="h-3 w-3" />
                      Definir con IA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Text */}
        <Card>
          <CardContent className="p-6">
            <div
              ref={textRef}
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900"
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                userSelect: 'text',
              }}
            >
              {documentText.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-2xl font-bold mb-4">
                      {line.replace('# ', '')}
                    </h1>
                  );
                } else if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-bold mt-6 mb-3">
                      {line.replace('## ', '')}
                    </h2>
                  );
                } else if (line.includes('**')) {
                  // Handle bold text
                  const parts = line.split('**');
                  return (
                    <p key={index} className="mb-3">
                      {parts.map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                  );
                } else if (line.trim()) {
                  return (
                    <p key={index} className="mb-3">
                      {line}
                    </p>
                  );
                } else {
                  return <br key={index} />;
                }
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Definition Dialog */}
      <Dialog open={showDefinition} onOpenChange={setShowDefinition}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Definición Contextual
            </DialogTitle>
            <DialogDescription>
              Basada en {user?.career} y el contexto del documento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Badge className="mb-2">{selectedText}</Badge>
            </div>
            {isLoadingDefinition ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{definition}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
