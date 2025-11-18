import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white">

      <!-- Header -->
      <header class="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm animate-fade-down">
        <nav class="container mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md hover:scale-110 transition">
              <span class="text-white font-bold text-xl">T</span>
            </div>
            <span class="text-gray-800 font-bold text-2xl">TaskFlow</span>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 hover:text-blue-600 transition font-medium">Recursos</a>
            <a href="#benefits" class="text-gray-600 hover:text-blue-600 transition font-medium">Benefícios</a>
            <a href="#pricing" class="text-gray-600 hover:text-blue-600 transition font-medium">Preços</a>
          </div>
          <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md font-medium" [routerLink]="'/login'">
            Começar Agora
          </button>
        </nav>
      </header>

      <!-- Hero Section -->
      <section class="pt-32 pb-20 px-6 bg-gradient-to-b from-gray-50 to-white animate-fade-up">
        <div class="container mx-auto text-center">
          <div class="inline-block mb-6 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 animate-fade-up">
            <span class="text-blue-600 text-sm font-medium">✨ Organize seu trabalho de forma inteligente</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight animate-fade-up delay-1">
            Gerencie suas tarefas<br/>
            <span class="text-blue-600">com eficiência total</span>
          </h1>

          <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-up delay-2">
            TaskFlow é a plataforma completa para gerenciamento de tarefas que aumenta sua produtividade e mantém sua equipe sincronizada.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up delay-3">
            <button class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition" [routerLink]="'/login'">
              Experimentar Grátis
            </button>
            <button class="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition" [routerLink]="'/login'">
              Ver Demo
            </button>
          </div>

          <!-- Project Cards Preview -->
          <div class="mt-16 relative animate-fade-up delay-4">
            <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
            <div class="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Visualize seus projetos em tempo real</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div *ngFor="let project of sampleProjects" 
                     class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-left animate-fade-up-small">
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="font-semibold text-lg text-gray-800">{{project.name}}</h4>
                    <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-700 border border-green-200': project.status === 'active',
                            'bg-blue-100 text-blue-700 border border-blue-200': project.status === 'progress'
                          }">
                      {{project.statusText}}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">{{project.description}}</p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500 font-medium">Progresso</span>
                      <span class="text-gray-700 font-semibold">{{project.progress}}%</span>
                    </div>
                    <div class="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                      <div 
                        class="h-full rounded-full transition-all duration-500"
                        [style.width.%]="project.progress"
                        [ngClass]="{
                          'bg-green-500': project.progress === 100,
                          'bg-blue-500': project.progress >= 50 && project.progress < 100,
                          'bg-yellow-500': project.progress >= 25 && project.progress < 50
                        }">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 px-6 bg-white">
        <div class="container mx-auto">
          <div class="text-center mb-16 animate-fade-up">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Recursos Poderosos</h2>
            <p class="text-xl text-gray-600">Tudo que você precisa para gerenciar suas tarefas</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let feature of features" 
                 class="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition hover:shadow-lg transform hover:-translate-y-1 animate-fade-up-small">
              <div class="text-5xl mb-4">{{feature.icon}}</div>
              <h3 class="text-2xl font-bold text-gray-800 mb-3">{{feature.title}}</h3>
              <p class="text-gray-600">{{feature.description}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section id="benefits" class="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-up">
            <div>
              <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Produtividade em outro nível</h2>
              <p class="text-xl text-gray-600 mb-8">Com TaskFlow, você e sua equipe trabalham de forma mais inteligente, não mais difícil.</p>
              <div class="space-y-6">
                <div *ngFor="let benefit of benefits" class="flex items-start gap-4 animate-fade-up-small">
                  <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <span class="text-white text-2xl font-bold">✓</span>
                  </div>
                  <div>
                    <h4 class="text-xl font-semibold text-gray-800 mb-2">{{benefit.title}}</h4>
                    <p class="text-gray-600">{{benefit.description}}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative animate-fade-up delay-2">
              <div class="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div class="bg-white rounded-xl p-6 space-y-4 border border-gray-200">
                  <div *ngFor="let task of sampleTasks; let i = index" 
                       class="bg-gray-50 p-4 rounded-lg border-l-4 animate-pulse animate-fade-up-small"
                       [style.animation-delay]="i * 0.2 + 's'"
                       [ngClass]="{
                         'border-green-500': task.status === 'done',
                         'border-yellow-500': task.status === 'progress',
                         'border-blue-500': task.status === 'todo'
                       }">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-800 font-medium">{{task.name}}</span>
                      <span class="text-xs px-2 py-1 rounded font-medium"
                            [ngClass]="{
                              'bg-green-100 text-green-700': task.status === 'done',
                              'bg-yellow-100 text-yellow-700': task.status === 'progress',
                              'bg-blue-100 text-blue-700': task.status === 'todo'
                            }">
                        {{task.statusText}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-20 px-6 bg-white">
        <div class="container mx-auto">
          <div class="text-center mb-16 animate-fade-up">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Planos para todos os tamanhos</h2>
            <p class="text-xl text-gray-600">Escolha o plano ideal para você ou sua equipe</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div *ngFor="let plan of pricingPlans; let i = index" 
                 class="bg-white rounded-2xl p-8 border-2 transition-all duration-300 animate-fade-up-small"
                 [ngClass]="{
                   'border-gray-200 hover:border-gray-300 hover:shadow-lg': i !== 1,
                   'border-blue-500 shadow-xl scale-105': i === 1
                 }">
              <div *ngIf="i === 1" class="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4">
                MAIS POPULAR
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">{{plan.name}}</h3>
              <div class="mb-6">
                <span class="text-5xl font-bold text-gray-800">{{plan.price}}</span>
                <span class="text-gray-600">/{{plan.period}}</span>
              </div>
              <p class="text-gray-600 mb-6">{{plan.description}}</p>
              <button 
                class="w-full py-3 rounded-lg font-semibold transition mb-6 hover:scale-105"
                [ngClass]="{
                  'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50': i === 1,
                  'bg-blue-600 text-white hover:bg-blue-700': i !== 1
                }">
                {{plan.cta}}
              </button>
              <ul class="space-y-3">
                <li *ngFor="let feature of plan.features" class="flex items-start gap-3 animate-fade-up-small">
                  <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-600">{{feature}}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div class="container mx-auto animate-fade-up">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-up">Pronto para aumentar sua produtividade?</h2>
            <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-fade-up delay-1">
              Junte-se a milhares de equipes que já transformaram sua forma de trabalhar com TaskFlow
            </p>
            <button class="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-bold hover:shadow-2xl transition transform hover:scale-105 animate-fade-up delay-2" [routerLink]="'/login'">
              Começar Gratuitamente
            </button>
            <p class="text-blue-100 mt-4">Sem cartão de crédito necessário • 14 dias grátis</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 px-6 border-t border-gray-200 bg-white animate-fade-up">
        <div class="container mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 class="text-gray-800 font-semibold mb-4">Produto</h5>
              <ul class="space-y-2 text-gray-600">
                <li><a href="#" class="hover:text-blue-600 transition">Recursos</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Preços</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-gray-800 font-semibold mb-4">Empresa</h5>
              <ul class="space-y-2 text-gray-600">
                <li><a href="#" class="hover:text-blue-600 transition">Sobre</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Blog</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-gray-800 font-semibold mb-4">Suporte</h5>
              <ul class="space-y-2 text-gray-600">
                <li><a href="#" class="hover:text-blue-600 transition">Ajuda</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Contato</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-gray-800 font-semibold mb-4">Legal</h5>
              <ul class="space-y-2 text-gray-600">
                <li><a href="#" class="hover:text-blue-600 transition">Privacidade</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Termos</a></li>
                <li><a href="#" class="hover:text-blue-600 transition">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div class="text-center text-gray-600 pt-8 border-t border-gray-200">
            <p>© 2025 TaskFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    /* Pulsing already present */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Fade Up */
    @keyframes fade-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-up {
      animation: fade-up 0.8s ease forwards;
      opacity: 0;
    }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    .delay-3 { animation-delay: 0.6s; }
    .delay-4 { animation-delay: 0.8s; }

    /* Fade Up Small */
    .animate-fade-up-small {
      animation: fade-up 0.8s ease forwards;
      opacity: 0;
      animation-delay: 0.15s;
    }

    /* Fade Down */
    @keyframes fade-down {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-down {
      animation: fade-down 0.7s ease forwards;
      opacity: 0;
    }
  `]
})
export class LandingComponent {

  sampleProjects = [
    { 
      name: 'Website Redesign', 
      description: 'Modernização completa da interface', 
      progress: 75, 
      status: 'progress',
      statusText: 'Em Andamento'
    },
    { 
      name: 'App Mobile', 
      description: 'Desenvolvimento do aplicativo iOS e Android', 
      progress: 45, 
      status: 'progress',
      statusText: 'Em Andamento'
    },
    { 
      name: 'Marketing Q4', 
      description: 'Campanha de marketing do último trimestre', 
      progress: 100, 
      status: 'active',
      statusText: 'Concluído'
    }
  ];

  features = [
    { icon: '⚡', title: 'Super Rápido', description: 'Interface otimizada para máxima velocidade e eficiência no seu fluxo de trabalho.' },
    { icon: '🎯', title: 'Organização Inteligente', description: 'Sistema automático de priorização e categorização de tarefas baseado em IA.' },
    { icon: '👥', title: 'Colaboração em Tempo Real', description: 'Trabalhe junto com sua equipe e veja as atualizações acontecendo ao vivo.' },
    { icon: '📊', title: 'Relatórios Detalhados', description: 'Análises e insights sobre produtividade e progresso do seu time.' },
    { icon: '🔔', title: 'Notificações Inteligentes', description: 'Receba alertas personalizados sobre prazos e atualizações importantes.' },
    { icon: '🔒', title: 'Segurança Avançada', description: 'Seus dados protegidos com criptografia de ponta a ponta.' }
  ];

  benefits = [
    { title: 'Aumente a produtividade em 40%', description: 'Elimine distrações e foque no que realmente importa com nossas ferramentas de organização.' },
    { title: 'Sincronize toda a equipe', description: 'Mantenha todos na mesma página com atualizações em tempo real e comunicação integrada.' },
    { title: 'Nunca perca um prazo', description: 'Sistema inteligente de lembretes garante que você esteja sempre no controle.' }
  ];

  sampleTasks = [
    { name: 'Revisar apresentação', status: 'done', statusText: 'Concluída' },
    { name: 'Reunião com cliente', status: 'progress', statusText: 'Em andamento' },
    { name: 'Atualizar documentação', status: 'todo', statusText: 'Pendente' },
    { name: 'Code review PR #123', status: 'progress', statusText: 'Em andamento' }
  ];

  pricingPlans = [
    {
      name: 'Básico',
      price: 'Grátis',
      period: 'sempre',
      description: 'Perfeito para começar e pequenos projetos',
      cta: 'Começar Grátis',
      features: [
        'Até 5 projetos',
        '10 membros por projeto',
        'Armazenamento de 5GB',
        'Suporte por email',
        'Relatórios básicos'
      ]
    },
    {
      name: 'Profissional',
      price: 'R$ 29',
      period: 'mês',
      description: 'Ideal para equipes em crescimento',
      cta: 'Começar Teste Grátis',
      features: [
        'Projetos ilimitados',
        'Membros ilimitados',
        'Armazenamento de 100GB',
        'Suporte prioritário 24/7',
        'Relatórios avançados',
        'Integrações personalizadas',
        'API completa'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Para grandes organizações',
      cta: 'Falar com Vendas',
      features: [
        'Tudo do Profissional',
        'Armazenamento ilimitado',
        'Gerente de conta dedicado',
        'SLA garantido',
        'Treinamento personalizado',
        'Segurança avançada',
        'Deploy on-premise'
      ]
    }
  ];

}
