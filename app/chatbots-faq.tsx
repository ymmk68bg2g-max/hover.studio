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
    <Accordion className="faq-list chatbots-faq-list" type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem className="faq-item" key={item.id} value={item.id}>
          <AccordionTrigger className="faq-trigger" data-language-disclosure={`chatbots-faq-${item.id}`}>
            <span className="faq-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="faq-question content-subheading">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="faq-content">
            <p className="section-body">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
