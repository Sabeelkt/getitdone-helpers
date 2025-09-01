"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Languages, 
  Mic, 
  MicOff, 
  Speech, 
  Headphones, 
  MessageCircle,
  Keyboard,
  MicVocal
} from 'lucide-react';
import { toast } from 'sonner';

interface LocalizationVoiceProps {
  className?: string;
  onLanguageChange?: (locale: string) => void;
  onVoiceInput?: (text: string, context: 'task' | 'chat') => void;
  onTextToSpeech?: (text: string) => void;
  currentLocale?: string;
  disabled?: boolean;
}

interface SupportedLocale {
  code: string;
  name: string;
  flag: string;
  voiceSupported: boolean;
}

const supportedLocales: SupportedLocale[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', voiceSupported: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', voiceSupported: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', voiceSupported: true },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', voiceSupported: true },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', voiceSupported: true },
  { code: 'pt', name: 'Português', flag: '🇧🇷', voiceSupported: true },
  { code: 'zh', name: '中文', flag: '🇨🇳', voiceSupported: true },
  { code: 'ja', name: '日本語', flag: '🇯🇵', voiceSupported: true },
  { code: 'ko', name: '한국어', flag: '🇰🇷', voiceSupported: true },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', voiceSupported: false },
];

export default function LocalizationVoice({
  className = "",
  onLanguageChange,
  onVoiceInput,
  onTextToSpeech,
  currentLocale = 'en',
  disabled = false
}: LocalizationVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState([1]);
  const [speechPitch, setSpeechPitch] = useState([1]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceContext, setVoiceContext] = useState<'task' | 'chat' | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Check for speech recognition support
  const isSpeechRecognitionSupported = useCallback(() => {
    if (typeof window === "undefined") return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }, []);

  // Check for speech synthesis support
  const isSpeechSynthesisSupported = useCallback(() => {
    if (typeof window === "undefined") return false;
    return 'speechSynthesis' in window;
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined" || !isSpeechRecognitionSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLocale;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      if (finalTranscript && voiceContext) {
        // Check for simple commands
        const command = finalTranscript.toLowerCase().trim();
        if (command.includes('create task') || command.includes('new task')) {
          onVoiceInput?.('', 'task');
          toast.success('Opening task creator...');
        } else {
          onVoiceInput?.(finalTranscript, voiceContext);
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        toast.error('Microphone access denied. Please enable microphone permissions.');
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
      setVoiceContext(null);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLocale, voiceContext, onVoiceInput, isSpeechRecognitionSupported]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window === "undefined" || !isSpeechSynthesisSupported()) return;
    speechSynthesisRef.current = window.speechSynthesis;
  }, [isSpeechSynthesisSupported]);

  // Check microphone permission
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state);
        
        result.onchange = () => {
          setMicPermission(result.state);
        };
      } catch (error) {
        // Fallback for browsers that don't support permissions API
        setMicPermission('prompt');
      }
    };

    checkPermission();
  }, []);

  const handleLanguageChange = useCallback((locale: string) => {
    onLanguageChange?.(locale);
    
    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = locale;
    }
    
    toast.success(`Language changed to ${supportedLocales.find(l => l.code === locale)?.name}`);
  }, [onLanguageChange]);

  const startVoiceInput = useCallback((context: 'task' | 'chat') => {
    if (!voiceEnabled || !isSpeechRecognitionSupported() || disabled) {
      toast.error('Voice input is not available');
      return;
    }

    if (micPermission === 'denied') {
      toast.error('Microphone access is required for voice input');
      return;
    }

    setVoiceContext(context);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        toast.error('Failed to start voice recognition');
        setIsListening(false);
        setVoiceContext(null);
      }
    }
  }, [voiceEnabled, micPermission, disabled, isSpeechRecognitionSupported]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript('');
    setVoiceContext(null);
  }, []);

  const handleTextToSpeech = useCallback((text: string) => {
    if (!voiceEnabled || !isSpeechSynthesisSupported() || disabled) {
      toast.error('Text-to-speech is not available');
      return;
    }

    if (speechSynthesisRef.current) {
      // Stop any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLocale;
      utterance.rate = speechRate[0];
      utterance.pitch = speechPitch[0];
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error('Text-to-speech failed');
      };
      
      speechSynthesisRef.current.speak(utterance);
      onTextToSpeech?.(text);
    }
  }, [voiceEnabled, currentLocale, speechRate, speechPitch, disabled, onTextToSpeech, isSpeechSynthesisSupported]);

  const stopTextToSpeech = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const currentLocaleData = supportedLocales.find(l => l.code === currentLocale) || supportedLocales[0];
  const isVoiceSupported = currentLocaleData.voiceSupported && (isSpeechRecognitionSupported() || isSpeechSynthesisSupported());

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Language Selector */}
      <Select
        value={currentLocale}
        onValueChange={handleLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-auto min-w-[120px] bg-card border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLocaleData.flag}</span>
            <Languages className="h-4 w-4" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {supportedLocales.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{locale.flag}</span>
                <span>{locale.name}</span>
                {!locale.voiceSupported && (
                  <Badge variant="secondary" className="text-xs">
                    Text only
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Voice Controls - Mobile optimized sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !isVoiceSupported}
            className="relative"
          >
            {isListening ? (
              <MicVocal className="h-4 w-4 text-red-500" />
            ) : isSpeaking ? (
              <Speech className="h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
            {(isListening || isSpeaking) && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-2 w-2 p-0 animate-pulse"
              >
                <span className="sr-only">Active</span>
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[350px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Voice & Language
            </SheetTitle>
            <SheetDescription>
              Control voice input, text-to-speech, and language settings
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Voice Features Toggle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Voice Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Enable Voice</p>
                    <p className="text-xs text-muted-foreground">
                      Voice input and text-to-speech
                    </p>
                  </div>
                  <Switch
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                    disabled={disabled || !isVoiceSupported}
                  />
                </div>

                {!isVoiceSupported && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Voice features not supported in current language or browser
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Input Controls */}
            {voiceEnabled && isVoiceSupported && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Voice Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {micPermission === 'denied' && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-xs text-destructive">
                        Microphone access denied. Please enable permissions in your browser settings.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={isListening && voiceContext === 'task' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => isListening ? stopVoiceInput() : startVoiceInput('task')}
                      disabled={disabled || micPermission === 'denied'}
                      className="flex items-center gap-2"
                    >
                      {isListening && voiceContext === 'task' ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Task
                        </>
                      )}
                    </Button>

                    <Button
                      variant={isListening && voiceContext === 'chat' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => isListening ? stopVoiceInput() : startVoiceInput('chat')}
                      disabled={disabled || micPermission === 'denied'}
                      className="flex items-center gap-2"
                    >
                      {isListening && voiceContext === 'chat' ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </>
                      )}
                    </Button>
                  </div>

                  {isListening && transcript && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <p className="text-xs font-medium mb-1">Live Transcript:</p>
                      <p className="text-sm">{transcript}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Say "create task" or "new task" to open task creator</p>
                    <p>• Transcription processed locally for privacy</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text-to-Speech Controls */}
            {voiceEnabled && isSpeechSynthesisSupported() && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Text-to-Speech
                    {isSpeaking && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stopTextToSpeech}
                        className="h-6 px-2"
                      >
                        <MicOff className="h-3 w-3" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTextToSpeech('This is a test of the text to speech feature.')}
                    disabled={disabled || isSpeaking}
                    className="w-full flex items-center gap-2"
                  >
                    <Speech className="h-4 w-4" />
                    Test Voice
                  </Button>

                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        Advanced Settings
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">
                          Speech Rate: {speechRate[0]}x
                        </label>
                        <Slider
                          value={speechRate}
                          onValueChange={setSpeechRate}
                          min={0.5}
                          max={2}
                          step={0.1}
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium">
                          Speech Pitch: {speechPitch[0]}x
                        </label>
                        <Slider
                          value={speechPitch}
                          onValueChange={setSpeechPitch}
                          min={0.5}
                          max={2}
                          step={0.1}
                          disabled={disabled}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* Fallback Notice */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Keyboard input always available as fallback
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Live Status Indicator */}
      {(isListening || isSpeaking) && (
        <Badge
          variant={isListening ? "destructive" : "default"}
          className="animate-pulse"
        >
          {isListening ? (
            <>
              <MicVocal className="h-3 w-3 mr-1" />
              Listening
            </>
          ) : (
            <>
              <Speech className="h-3 w-3 mr-1" />
              Speaking
            </>
          )}
        </Badge>
      )}
    </div>
  );
}