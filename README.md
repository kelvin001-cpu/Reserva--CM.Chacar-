# 🎓 Programa Conect - NTEi Chácara v2.0

## Visão Geral
Sistema completo de gestão educacional inteligente para a Escola Municipal CM. Chácara Das Garças, com suporte a múltiplos cargos, permissões avançadas e inteligência artificial integrada.

## ✨ Principais Recursos

### 🔐 Sistema de Autenticação
- **6 Tipos de Usuários**: Professor, Gestão, Secretaria, SMETi, SEFE e NTEi
- **Permissões Diferenciadas**: Cada cargo tem acesso restrito a menus específicos
- **Primeira Execução Segura**: NTEi cria primeira conta com senha forte
- **Senhas Padrões**: Fornecidas por cargo, com obrigação de alterar no primeiro acesso

### 📅 Módulo Operacional
- Nova reserva de equipamentos
- Abertura de chamados (com categorias diferenciadas por cargo)
- Visualização de reservas ativas em tempo real
- Para SEFE: Chamado direto com NTEi (sem categorias)

### 📚 Módulo Pedagógico
- Planejamento de aulas
- Gestão de turmas
- Integração com conteúdos educacionais

### 👥 Módulo Alunos
- Cadastro e gestão de alunos
- Perfil 360° do aluno
- Portfólio digital
- Gamificação com conquistas

### 🎓 Módulo Formação
- Trilhas formativas
- Histórico profissional de professores
- Biblioteca digital

### 💬 Módulo Comunicação
- **Chat Professor ↔ NTEi**: Professor e NTEi podem conversar
- **Chat SEFE ↔ NTEi**: SEFE pode falar apenas com NTEi
- **Sem cruzamento de conversas**: Cada grupo isolado
- Mural de avisos
- Enquetes institucionais
- Central de comunicados

### 🛡️ Painel Admin NTEi
- Controle master de manutenção
- Gestão dinâmica de menus
- Criar, editar e deletar menus sem alterar código
- Definir permissões por cargo ou prontuário (ACL)
- Cadastro de equipamentos
- Aprovação/bloqueio de contas
- Redefinição de senhas
- Monitoramento de usuários

### 🌍 Restrição Temporal SEFE
- **Acesso SEFE**: Apenas em Terça (07/07) e Quarta (08/07)
- **Link Alternativo**: Fornecido pelo NTEi
- **Acesso Restrito**: SEFE só vê seu próprio painel
- **Fora dos dias**: Mensagem informando indisponibilidade
- **Controle do NTEi**: Pode ativar/desativar manualmente

### 📊 Dashboard (Gestão & NTEi)
- KPIs em tempo real
- Gráficos de uso
- Alertas automáticos
- Análise de equipamentos

## 🚀 Como Usar

### Primeira Execução (NTEi)
1. Acesse a plataforma
2. Clique em "INTRO" para ver apresentação
3. Clique em "Acessar o Sistema"
4. Vá para "NTEi"
5. ID: `46690`
6. Senha: `nti2026`
7. Sistema pedirá para definir uma nova senha forte
8. Pronto! Conta master criada

### Adicionar Novo Usuário
1. Na tela de login, clique em "CADASTRO"
2. Preencha os dados
3. Selecione o cargo
4. Clique em "Solicitar Cadastro"
5. O NTEi receberá a solicitação e ativará a conta

### Login Normal
1. Selecione seu cargo
2. Informe prontuário e senha
3. Na primeira vez, altere a senha padrão
4. Acesso concedido!

## 🔐 Segurança & Permissões

### Senhas Padrão (Mudança Obrigatória)
- **Professor**: `pmspmudar123`
- **Gestão**: `pmspgestores2026`
- **Secretaria**: `secretaria2026`
- **SMETi**: `smeti2026`
- **SEFE**: `sefe2026`
- **NTEi**: `nti2026` (criar primeira conta)

### Visibilidade de Menus

**Professor & SEFE:**
- ✅ Operacional
- ✅ Pedagógico
- ✅ Alunos
- ✅ Formação
- ✅ Comunicação
- ❌ Dashboard
- ❌ Admin NTEi

**Gestão & SMETi:**
- ✅ Dashboard
- ✅ Operacional
- ✅ Pedagógico
- ✅ Alunos
- ✅ Formação
- ✅ Comunicação
- ❌ Admin NTEi

**NTEi:**
- ✅ TUDO (incluso Admin NTEi)

## 🎯 Funcionalidades Especiais

### SEFE (Secretário Executivo da Educação)
- ⏰ Acesso temporário: Terça (07/07) e Quarta (08/07)
- 📞 Pode abrir chamado direto com NTEi
- 💬 Chat exclusivo com NTEi
- 🔐 Sem aprovação de cadastro necessária
- 🎓 Acesso semelhante ao Professor (menus restritos)
- 🔗 Link alternativo fornecido pelo NTEi

### NTEi (Master)
- 🎛️ Controle total da plataforma
- ➕ Criar novos menus dinamicamente
- ✏️ Editar menus existentes
- 🗑️ Deletar menus
- 🔐 Definir permissões por prontuário (ACL)
- 👥 Gerenciar todos os usuários
- 🔑 Redefinir senhas
- ⛔ Bloquear/desbloquear contas
- 🛠️ Ativar/desativar manutenção do sistema

## 📱 Responsividade
Sistema totalmente responsivo, funcionando perfeitamente em:
- 🖥️ Computadores Desktop
- 💻 Notebooks
- 📱 Tablets
- 📲 Smartphones

## 🔧 Tecnologias
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Firebase Realtime Database
- **Autenticação**: Sistema customizado com Firebase
- **Gráficos**: Chart.js
- **QR Code**: QRCode.js
- **Ícones**: Font Awesome 6.4.0
- **Fontes**: Poppins, Orbitron (Google Fonts)

## 📧 Suporte & Desenvolvimento

**Criador & Desenvolvedor:**
- 👨‍💻 **Kelvin Almeida**
- 🎓 Estagiário do Programa Conect
- 📧 [kelvin.46690@edu.santanadeparnaiba.sp.gov.br](mailto:kelvin.46690@edu.santanadeparnaiba.sp.gov.br)

## 📝 Licença
Desenvolvido para uso exclusivo da E.M. CM. Chácara Das Garças - Santana de Parnaíba, SP.

## 🎉 Versão Atual
**v2.0** - Agosto 2026
- ✅ Sistema reorganizado
- ✅ Permissões avançadas implementadas
- ✅ SEFE integrado
- ✅ Menus customizáveis
- ✅ ACL por prontuário
- ✅ Intro e apresentação
- ✅ Footer com créditos
- ✅ Código 100% funcional

---

**"Construindo uma Geração de Vencedores"** 🚀
