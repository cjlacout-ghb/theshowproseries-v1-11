"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// --- CONFIGURATION ---
// TODO: USER - Replace this URL with your unique Formspree Endpoint
// 1. Go to https://formspree.io/ and create a form for: cjlacout.dev@gmail.com
// 2. Create a new form
// 3. Paste the URL here (e.g., "https://formspree.io/f/xyza...")
const FORMSPREE_ENDPOINT = "https://formspree.io/f/maqeayby";

const formSchema = z.object({
    name: z.string().min(2, { message: "Por favor, ingresá tu nombre." }),
    lastname: z.string().min(2, { message: "Por favor, ingresá tu apellido." }),
    email: z.string().email({ message: "Por favor, ingresá un email válido." }),
    country: z.string().min(1, { message: "Por favor, seleccioná un país." }),
    message: z.string().min(10, {
        message: "El mensaje debe tener al menos 10 caracteres.",
    }),
});

export function FeedbackDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            lastname: "",
            email: "",
            country: "",
            message: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID_HERE")) {
            toast({
                title: "Configuración Requerida",
                description: "Por favor actualiza la URL de Formspree en FeedbackDialog.tsx para enviar mensajes.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast({
                    title: "¡Mensaje Enviado!",
                    description: "Gracias por tus comentarios. Los revisaremos pronto.",
                });
                form.reset();
                setOpen(false);
            } else {
                const data = await response.json();
                console.error("Formspree error:", data);
                throw new Error("Failed to send message");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Algo salió mal. Por favor, intentá de nuevo más tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="group flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground/50 hover:text-primary transition-colors duration-300 uppercase tracking-widest"
                >
                    <MessageSquarePlus className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span>Reportar / Sugerencias</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <MessageSquarePlus className="w-5 h-5 text-primary" />
                        Enviar Comentarios
                    </DialogTitle>
                    <DialogDescription>
                        ¿Encontraste un error? ¿Tenés una sugerencia? Por favor, contanos.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tu Nombre" className="bg-secondary/20 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tu Apellido" className="bg-secondary/20 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="tu@email.com" className="bg-secondary/20 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">País</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-secondary/20 border-primary/10">
                                                    <SelectValue placeholder="Seleccioná un país" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Argentina">Argentina</SelectItem>
                                                <SelectItem value="Bolivia">Bolivia</SelectItem>
                                                <SelectItem value="Brasil">Brasil</SelectItem>
                                                <SelectItem value="Canada">Canadá</SelectItem>
                                                <SelectItem value="Chile">Chile</SelectItem>
                                                <SelectItem value="Colombia">Colombia</SelectItem>
                                                <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                                                <SelectItem value="Cuba">Cuba</SelectItem>
                                                <SelectItem value="Ecuador">Ecuador</SelectItem>
                                                <SelectItem value="Espana">España</SelectItem>
                                                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                                                <SelectItem value="Mexico">México</SelectItem>
                                                <SelectItem value="Paraguay">Paraguay</SelectItem>
                                                <SelectItem value="Peru">Perú</SelectItem>
                                                <SelectItem value="Puerto Rico">Puerto Rico</SelectItem>
                                                <SelectItem value="Republica Dominicana">República Dominicana</SelectItem>
                                                <SelectItem value="Uruguay">Uruguay</SelectItem>
                                                <SelectItem value="Venezuela">Venezuela</SelectItem>
                                                <SelectItem value="Otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Mensaje</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder=""
                                            className="min-h-[100px] bg-secondary/20 border-primary/10 resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Mensaje
                                        <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
