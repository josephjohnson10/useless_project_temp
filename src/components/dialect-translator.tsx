'use client';

import type { ElementType } from 'react';
import React, { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Anchor,
  BookOpen,
  Building2,
  Castle,
  Factory,
  Languages,
  LoaderCircle,
  MapPin,
  Mountain,
  Music,
  Palmtree,
  Plane,
  Sailboat,
  Sparkles,
  Sprout,
  Trees,
  Wheat,
  Search,
  Book,
  Repeat,
} from 'lucide-react';
import debounce from 'lodash.debounce';

import type { DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import type { SentenceAnalysisOutput } from '@/ai/flows/sentence-analysis';
import type { ReverseTranslationOutput } from '@/ai/flows/reverse-translation';
import type { CulturalInsightOutput } from '@/ai/flows/cultural-insights';

import { 
  getDialectTranslations, 
  analyzeSentenceApi, 
  reverseTranslateApi,
  getCulturalInsightsApi,
  DialectTranslationServerInput 
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

type DialogState = {
  type: 'reverse' | 'insight' | null;
  data: ReverseTranslationOutput | CulturalInsightOutput | null;
  loading: boolean;
  district?: string;
};

export default function DialectTranslator() {
  const [translations, setTranslations] =
    useState<DialectTranslationOutput | null>(null);
  const [analysis, setAnalysis] = useState<SentenceAnalysisOutput | null>(null);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, data: null, loading: false });

  const { toast } = useToast();

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


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setTranslations(null);

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

  const handleReverseTranslate = async (slang: string, district: string) => {
    setDialogState({ type: 'reverse', data: null, loading: true, district });
    try {
      const result = await reverseTranslateApi({ slangSentence: slang, district });
      setDialogState({ type: 'reverse', data: result, loading: false, district });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reverse translate.', variant: 'destructive' });
      setDialogState({ type: null, data: null, loading: false });
    }
  };

  const handleCulturalInsights = async (district: string) => {
    setDialogState({ type: 'insight', data: null, loading: true, district });
    try {
      const result = await getCulturalInsightsApi({ district });
      setDialogState({ type: 'insight', data: result, loading: false, district });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to get cultural insights.', variant: 'destructive' });
      setDialogState({ type: null, data: null, loading: false });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8 max-w-7xl mx-auto">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dialect Translations (Malayalam)</CardTitle>
            <CardDescription>
              Results from all 14 districts will appear here in Malayalam script.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {translations.map((item) => {
                  const Icon = districtIcons[item.district] || MapPin;
                  return (
                    <Card key={item.district} className="flex flex-col border-primary/20">
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
                          <Progress value={item.meaningMatchScore} className="h-2" />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-start gap-2 w-full">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleReverseTranslate(item.slang, item.district)}>
                                <Repeat className="mr-2 h-4 w-4"/> Translate Back
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                           <Dialog>
                            <DialogTrigger asChild>
                               <Button variant="ghost" size="sm" onClick={() => handleCulturalInsights(item.district)}>
                                <Book className="mr-2 h-4 w-4"/> Insights
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
             {!loading && !translations && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                    <Languages className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">വിവർത്തനങ്ങളൊന്നും ഇതുവരെയില്ല</h3>
                    <p className="text-muted-foreground">
                        ഒരു വാക്യം നൽകി "ഉപഭാഷകൾ മാറ്റുക" ക്ലിക്കുചെയ്യുക.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>Enter your sentence in Manglish to get started.</CardDescription>
            </CardHeader>
            <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className="resize-none min-h-[160px]"
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
                            <span className="font-semibold text-primary">Input Analysis:</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={analysis.isStandard ? 'default' : 'destructive'}>{analysis.dialect}</Badge>
                                <span className='text-muted-foreground text-xs'>({analysis.confidence}%)</span>
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
              
              <Button type="submit" disabled={loading} className="w-full" size="lg">
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

       <Dialog open={dialogState.loading || dialogState.data !== null} onOpenChange={() => setDialogState({ type: null, data: null, loading: false })}>
        <DialogContent>
          {dialogState.loading ? (
             <DialogHeader>
                <DialogTitle>Loading...</DialogTitle>
                <div className="flex items-center justify-center p-8">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DialogHeader>
          ) : (
            <>
              {dialogState.type === 'reverse' && dialogState.data && 'standardSentence' in dialogState.data && (
                <>
                  <DialogHeader>
                    <DialogTitle>Reverse Translation: {dialogState.district}</DialogTitle>
                    <DialogDescription>The slang sentence translated back to standard Malayalam.</DialogDescription>
                  </DialogHeader>
                  <p className="text-xl font-semibold text-center py-4 font-body">"{dialogState.data.standardSentence}"</p>
                </>
              )}
              {dialogState.type === 'insight' && dialogState.data && 'insight' in dialogState.data && (
                 <>
                  <DialogHeader>
                    <DialogTitle>Cultural Insight: {dialogState.district}</DialogTitle>
                     <DialogDescription>Interesting facts about the {dialogState.district} dialect.</DialogDescription>
                  </DialogHeader>
                  <div className="prose prose-sm max-w-none">
                    <p>{dialogState.data.insight}</p>
                    <h4 className="font-semibold">Popular Phrases:</h4>
                    <ul className='font-body'>
                      {dialogState.data.popularPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
