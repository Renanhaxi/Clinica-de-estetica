/**
 * BELLA ESTÉTICA • DRA. LUCY - SCRIPT PRINCIPAL
 * Funcionalidades: Header dinâmico, Menu Mobile, FAQ acessível,
 * Slider Interativo de Antes/Depois (Otomodelação), Modal de Triagem Obrigatório em Etapas,
 * Máscara de Telefone, Validações Visuais e Redirecionamento Qualificado WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Header Dinâmico (Efeito de Scroll)
       ========================================================================== */
    const header = document.getElementById('header');
    
    function updateHeaderOnScroll() {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    updateHeaderOnScroll();

    /* ==========================================================================
       2. Menu Mobile (Drawer & Hambúrguer)
       ========================================================================== */
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        function toggleMobileMenu() {
            const isOpen = navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isOpen);
            document.body.classList.toggle('no-scroll', !isOpen);
        }

        function closeMobileMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }

        navToggle.addEventListener('click', toggleMobileMenu);

        // Fecha menu ao clicar em qualquer link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Fecha menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    /* ==========================================================================
       3. Slider Interativo de Antes e Depois (Drag / Touch / Keyboard)
       ========================================================================== */
    const sliderContainer = document.getElementById('before-after-slider');
    const afterImgWrap = document.getElementById('after-img-wrap');
    const sliderHandle = document.getElementById('slider-handle');

    if (sliderContainer && afterImgWrap && sliderHandle) {
        let isSliding = false;

        function setSliderPosition(percentage) {
            const clamped = Math.max(0, Math.min(100, percentage));
            afterImgWrap.style.width = `${clamped}%`;
            sliderHandle.style.left = `${clamped}%`;
            sliderHandle.setAttribute('aria-valuenow', Math.round(clamped));
        }

        function handleMove(e) {
            if (!isSliding) return;
            const rect = sliderContainer.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const position = clientX - rect.left;
            const percentage = (position / rect.width) * 100;
            setSliderPosition(percentage);
        }

        function startSlide(e) {
            isSliding = true;
            handleMove(e);
        }

        function stopSlide() {
            isSliding = false;
        }

        // Mouse Events
        sliderContainer.addEventListener('mousedown', startSlide);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', stopSlide);

        // Touch Events
        sliderContainer.addEventListener('touchstart', startSlide, { passive: true });
        window.addEventListener('touchmove', handleMove, { passive: true });
        window.addEventListener('touchend', stopSlide);

        // Keyboard Accessibility (Setas Esquerda e Direita)
        sliderHandle.addEventListener('keydown', (e) => {
            let currentVal = parseInt(sliderHandle.getAttribute('aria-valuenow')) || 50;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                setSliderPosition(currentVal - 5);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                setSliderPosition(currentVal + 5);
            }
        });
    }

    /* ==========================================================================
       4. FAQ Accordion Acessível
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const isCurrentlyActive = item.classList.contains('active');
            
            // Fecha todos os itens e reseta aria-expanded
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
                const btn = faqItem.querySelector('.faq-question');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            
            // Se não estava ativo, abre
            if (!isCurrentlyActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ==========================================================================
       5. Modal de Triagem & Qualificação
       ========================================================================== */
    const modal = document.getElementById('qualification-modal');
    const triggers = document.querySelectorAll('.btn-trigger-modal');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('triage-form');
    const steps = document.querySelectorAll('.form-step-panel');
    const progressBar = document.getElementById('progress-bar');
    const nextButtons = document.querySelectorAll('.btn-next');
    const backButtons = document.querySelectorAll('.btn-back');
    const feedbackBox = document.getElementById('form-feedback');
    
    let currentStep = 1;

    // Exibir mensagem de feedback visual elegante (sem alert nativo)
    function showFeedback(message, type = 'error') {
        if (!feedbackBox) return;
        feedbackBox.textContent = message;
        feedbackBox.className = `form-feedback active ${type}`;
        
        // Auto esconder após 4 segundos
        setTimeout(() => {
            feedbackBox.classList.remove('active');
        }, 4000);
    }

    function clearFeedback() {
        if (feedbackBox) {
            feedbackBox.classList.remove('active');
            feedbackBox.textContent = '';
        }
    }

    // Abrir Modal
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        resetTriage();
        clearFeedback();
    }

    // Fechar Modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        clearFeedback();
    }

    triggers.forEach(trigger => trigger.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Fechar ao clicar no backdrop escuro
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Prevenir submit padrão do formulário
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSubmit();
        });
    }

    // Seleção de Cards de Opção (Mouse e Teclado)
    steps.forEach(step => {
        const optionCards = step.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            function selectCard() {
                optionCards.forEach(c => {
                    c.classList.remove('selected');
                    c.setAttribute('aria-checked', 'false');
                });
                card.classList.add('selected');
                card.setAttribute('aria-checked', 'true');
                clearFeedback();
            }

            card.addEventListener('click', selectCard);

            // Suporte para teclas Enter e Barra de Espaço
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard();
                }
            });
        });
    });

    // Navegação: Botão Avançar
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepPanel = btn.closest('.form-step-panel');
            const stepNum = parseInt(stepPanel.getAttribute('data-step'));
            
            if (stepNum < 3) {
                const selected = stepPanel.querySelector('.option-card.selected');
                if (!selected) {
                    showFeedback('Por favor, selecione uma opção para continuar.', 'error');
                    return;
                }
                clearFeedback();
                goToStep(stepNum + 1);
            }
        });
    });

    // Navegação: Botão Voltar
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepPanel = btn.closest('.form-step-panel');
            const stepNum = parseInt(stepPanel.getAttribute('data-step'));
            if (stepNum > 1) {
                clearFeedback();
                goToStep(stepNum - 1);
            }
        });
    });

    // Navegar entre etapas
    function goToStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.getAttribute('data-step')) === stepNumber) {
                step.classList.add('active');
            }
        });
        currentStep = stepNumber;
        updateProgress();

        // Foco automático no campo de nome na Etapa 3
        if (stepNumber === 3) {
            const nameInput = document.getElementById('user-name');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 150);
            }
        }
    }

    // Atualizar Barra de Progresso
    function updateProgress() {
        const percentage = (currentStep / 3) * 100;
        if (progressBar) progressBar.style.width = `${percentage}%`;
    }

    // Finalizar e Enviar para WhatsApp
    const btnAnalyze = document.querySelector('.btn-analyze');
    if (btnAnalyze) {
        btnAnalyze.addEventListener('click', handleSubmit);
    }

    function handleSubmit() {
        const nameInput = document.getElementById('user-name');
        const nameVal = nameInput ? nameInput.value.trim() : '';
        
        // Validação simples de Nome
        if (!nameVal || nameVal.length < 2) {
            showFeedback('Por favor, informe seu nome para continuar.', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        clearFeedback();
        sendToWhatsApp(nameVal);
    }

    // Redirecionamento formatado para o WhatsApp da Clínica da Dra. Lucy
    function sendToWhatsApp(name) {
        const perfilPaciente = document.querySelector('.form-step-panel[data-step="1"] .option-card.selected')?.getAttribute('data-value') || 'Otomodelação';
        const objetivoHistorico = document.querySelector('.form-step-panel[data-step="2"] .option-card.selected')?.getAttribute('data-value') || 'Harmonização de Orelhas';

        const texto = `Olá Dra. Lucy! Meu nome é *${name}* e realizei a triagem online no site da Bella Estética:\n\n` +
                      `👂 *Para quem é:* ${perfilPaciente}\n` +
                      `🎯 *Objetivo / Desejo:* ${objetivoHistorico}\n\n` +
                      `Gostaria de verificar as datas disponíveis para minha avaliação de Otomodelação em Belém/PA!`;

        // Contato direto Dra. Lucy: (91) 98299-9189
        const telefoneClinica = "5591982999189";
        const url = `https://wa.me/${telefoneClinica}?text=${encodeURIComponent(texto)}`;
        
        // Tenta abrir em nova aba ou redirecionar
        const win = window.open(url, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = url;
        }
        
        setTimeout(() => {
            closeModal();
            resetTriage();
        }, 1200);
    }

    // Reset do Formulário
    function resetTriage() {
        currentStep = 1;
        goToStep(1);
        document.querySelectorAll('.option-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
        });
        const nameInp = document.getElementById('user-name');
        if (nameInp) nameInp.value = '';
    }

    /* ==========================================================================
       6. Animações de Scroll Reveal (IntersectionObserver)
       ========================================================================== */
    const reveals = document.querySelectorAll(".reveal");

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, { threshold: 0.12 });

        reveals.forEach(reveal => observer.observe(reveal));
    } else {
        // Fallback para navegadores sem suporte
        reveals.forEach(reveal => reveal.classList.add('active'));
    }
});

