'use client';

import type { ElementType } from 'react';
import React, { useState, useTransition, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Anchor,
  BookOpen,
  Building2,
  Castle,
  ClipboardCopy,
  Factory,
  Languages,
  LoaderCircle,
  MapPin,
  Mountain,
  Music,
  Palmtree,
  Plane,
  Sailboat,
  Search,
  Repeat,
  Sparkles,
  Sprout,
  Trees,
  Wheat,
  Info,
  Volume2,
} from 'lucide-react';
import debounce from 'lodash.debounce';

import type { DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import type { SentenceAnalysisOutput } from '@/ai/flows/sentence-analysis';
import type { ReverseTranslationOutput } from '@/ai/flows/reverse-translation';
import type { CulturalInsightOutput } from '@/ai/flows/cultural-insights';
import type { TextToSpeechOutput } from '@/ai/flows/text-to-speech';

import {
  getDialectTranslations,
  analyzeSentenceApi,
  reverseTranslateApi,
  getCulturalInsightsApi,
  textToSpeechApi,
  DialectTranslationServerInput,
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { KeralaMap } from './kerala-map';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  sentence: z
    .string()
    .min(1, { message: 'Please enter a sentence to translate.' }),
  slangIntensity: z.number().min(0).max(2),
});

const districtIcons: { [key: string]: ElementType } = {
  Thiruvananthapuram: Building2,
  Kollam: Anchor,
  Pathanamthitta: Sprout,
  Alappuzha: Sailboat,
  Kottayam: BookOpen,
  Idukki: Mountain,
  Ernakulam: Factory,
  Thrissur: Music,
  Palakkad: Wheat,
  Malappuram: Plane,
  Kozhikode: Palmtree,
  Wayanad: Trees,
  Kannur: Castle,
  Kasaragod: Languages,
  Standard: Languages,
};

const intensityLabels: { [key: number]: string } = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

const ActionDialog: React.FC<{
  title: string;
  triggerIcon: ElementType;
  triggerText: string;
  onOpen: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
}> = ({ title, triggerIcon: Icon, triggerText, onOpen, isLoading, error, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={async () => await onOpen()}>
          <Icon className="mr-2 h-4 w-4" /> {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive p-4">{error}</div>
        ) : (
          children
        )}
      </DialogContent>
    </Dialog>
  );
};


export default function DialectTranslator() {
  const [translations, setTranslations] =
    useState<DialectTranslationOutput | null>(null);
  const [analysis, setAnalysis] = useState<SentenceAnalysisOutput | null>(null);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [reverseTranslationResult, setReverseTranslationResult] = useState<ReverseTranslationOutput | null>(null);
  const [culturalInsights, setCulturalInsights] = useState<CulturalInsightOutput | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);
  const [loadingAudioDistrict, setLoadingAudioDistrict] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: 'Njan nattilekku pokunnu, veettil ellavarum enthu cheyyunnu?',
      slangIntensity: 1, // Medium
    },
  });

  const debouncedAnalysis = useCallback(
    debounce((sentence: string) => {
      if (sentence.trim().length > 5) {
        startAnalyzing(async () => {
          try {
            const result = await analyzeSentenceApi({ sentence });
            setAnalysis(result);
          } catch (error) {
            console.error('Failed to analyze sentence', error);
            setAnalysis(null);
          }
        });
      } else {
        setAnalysis(null);
      }
    }, 500),
    []
  );

  const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('sentence', e.target.value);
    debouncedAnalysis(e.target.value);
  };

  const handleGetCulturalInsights = useCallback(async (district: string) => {
    setIsActionLoading(true);
    setActionError(null);
    setCulturalInsights(null);
    try {
      const result = await getCulturalInsightsApi({ district });
      setCulturalInsights(result);
    } catch (error) {
      setActionError('Failed to get cultural insights.');
      setCulturalInsights(null);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setTranslations(null);
    setHighlightedDistrict(null);
    setCulturalInsights(null);

    const intensityMap: Array<'low' | 'medium' | 'high'> = [
      'low',
      'medium',
      'high',
    ];
    const input: DialectTranslationServerInput = {
      sentence: values.sentence,
      slangIntensity: intensityMap[values.slangIntensity],
    };

    try {
      const result = await getDialectTranslations(input);
      setTranslations(result);
      if (result && result.length > 0) {
        setHighlightedDistrict(result[0].district);
        await handleGetCulturalInsights(result[0].district);
      }
    } catch (error) {
      toast({
        title: 'Translation Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Translation copied to clipboard.' });
  };

  const handleReverseTranslate = async (slangSentence: string, district: string) => {
    setIsActionLoading(true);
    setActionError(null);
    setReverseTranslationResult(null);
    try {
      const result = await reverseTranslateApi({ slangSentence, district });
      setReverseTranslationResult(result);
    } catch (error) {
      setActionError('Failed to get reverse translation.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCardClick = (district: string) => {
    setHighlightedDistrict(district);
    handleGetCulturalInsights(district);
  }

  const handleListen = async (text: string, district: string) => {
    setLoadingAudioDistrict(district);
    try {
        const result: TextToSpeechOutput = await textToSpeechApi({ text });
        if (audioRef.current) {
            audioRef.current.src = result.audio;
            await audioRef.current.play();
        }
    } catch (error) {
        toast({
            title: 'Audio Error',
            description: 'Failed to generate audio. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setLoadingAudioDistrict(null);
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8 max-w-7xl w-full mx-auto">
      <audio ref={audioRef} />
      <div className="lg:col-span-2 xl:col-span-3">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Dialect Translations (Malayalam)</CardTitle>
            <CardDescription>
              Results from all 14 districts will appear here in Malayalam script.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 14 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-5 w-4/5" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-5 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            {!loading && translations && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {translations.map((item) => {
                  const Icon = districtIcons[item.district] || MapPin;

                  return (
                    <Card
                      key={item.district}
                      className={cn(
                        "flex flex-col border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer",
                        highlightedDistrict === item.district ? 'border-primary/80 scale-105 shadow-lg' : 'hover:scale-102'
                      )}
                      onMouseEnter={() => setHighlightedDistrict(item.district)}
                      onClick={() => handleCardClick(item.district)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-lg">
                          <Icon className="h-6 w-6 text-primary" />
                          {item.district}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-xl font-medium text-foreground/90 font-body">
                          {item.slang}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-2">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Meaning Match
                            </span>
                            <span className="text-xs font-bold text-accent">
                              {item.meaningMatchScore}%
                            </span>
                          </div>
                          <Progress
                            value={item.meaningMatchScore}
                            className="h-2"
                          />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-start flex-wrap gap-1 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleListen(item.slang, item.district);
                            }}
                            disabled={loadingAudioDistrict === item.district}
                          >
                            {loadingAudioDistrict === item.district ? (
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="mr-2 h-4 w-4" />
                            )}
                            Listen
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(item.slang)
                            }}
                          >
                            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                          </Button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ActionDialog
                                title={`Reverse Translation: ${item.district}`}
                                triggerIcon={Repeat}
                                triggerText="Translate Back"
                                onOpen={() => handleReverseTranslate(item.slang, item.district)}
                                isLoading={isActionLoading}
                                error={actionError}
                              >
                                {reverseTranslationResult && (
                                  <p className="p-4 text-lg">{reverseTranslationResult.standardSentence}</p>
                                )}
                              </ActionDialog>
                          </div>
                          
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            {!loading && !translations && (
               <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px] bg-secondary/30">
                 <KeralaMap className="w-full max-w-sm h-auto" />
                 <h3 className="text-xl font-bold mt-4">
                   Translate Manglish to Local Dialects
                 </h3>
                 <p className="text-muted-foreground">
                   Enter a sentence to see it translated into the slangs of all 14 Kerala districts.
                 </p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:col-span-1 xl:col-span-1">
        <div className="sticky top-20">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>
                Enter your sentence in Manglish to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="sentence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-primary">
                          Sentence (Manglish)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Ente peru Joseph. Njan evideya pokunnu?"
                            className="resize-none min-h-[120px]"
                            {...field}
                            onChange={handleSentenceChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="h-12">
                    {(isAnalyzing || analysis) && (
                      <Card className="bg-secondary/50 border-primary/20">
                        <CardContent className="p-3">
                          {isAnalyzing ? (
                            <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Analyzing input...</span>
                            </div>
                          ) : analysis ? (
                            <div className="flex items-center gap-3">
                              <Search className="h-5 w-5 text-primary" />
                              <div className="text-sm">
                                <span className="font-semibold text-primary">
                                  Input Analysis:
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={
                                      analysis.isStandard
                                        ? 'default'
                                        : 'destructive'
                                    }
                                  >
                                    {analysis.dialect}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs">
                                    ({analysis.confidence}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="slangIntensity"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-base font-semibold text-primary">
                            Slang Intensity
                          </FormLabel>
                          <span className="font-bold text-accent text-sm">
                            {intensityLabels[field.value]}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            defaultValue={[1]}
                            min={0}
                            max={2}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Convert Dialects
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="sticky top-[34rem]">
            <Card>
                <CardHeader>
                    <CardTitle>Kerala Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <KeralaMap 
                        highlightedDistrict={highlightedDistrict}
                        onDistrictClick={(district) => handleCardClick(district)}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="sticky top-[58rem]">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Info className="h-6 w-6 text-primary" />
                  Cultural Insight
                </CardTitle>
                <CardDescription>{highlightedDistrict ?? 'Select a district'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isActionLoading ? (
                <div className="flex items-center justify-center p-8">
                  <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : actionError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              ): culturalInsights ? (
                <>
                  <p className="text-sm">{culturalInsights.insight}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Popular Phrases:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {culturalInsights.popularPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Click on a district card or on the map to see cultural insights.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
