"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ChatbotsFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function ChatbotsFaq({ items }: { items: readonly ChatbotsFaqItem[] }) {
  return (
    <Accordion className="chatbots-faq-list" type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem className="chatbots-faq-item" key={item.id} value={item.id}>
          <AccordionTrigger className="chatbots-faq-trigger" data-language-disclosure={`chatbots-faq-${item.id}`}>
            <span className="chatbots-faq-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="service-content-subheading">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="chatbots-faq-content">
            <p className="service-text-body">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
