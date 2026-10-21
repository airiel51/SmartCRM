import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../screens/dashboard_screen.dart' show BouncingTouchCard, PulsingDot;

class AgenticAIChatbotSheet extends StatefulWidget {
  final Function(int, {String? defaultBay})? onNavigateTab;
  const AgenticAIChatbotSheet({Key? key, this.onNavigateTab}) : super(key: key);

  static void show(BuildContext context, {Function(int, {String? defaultBay})? onNavigateTab}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AgenticAIChatbotSheet(onNavigateTab: onNavigateTab),
    );
  }

  @override
  State<AgenticAIChatbotSheet> createState() => _AgenticAIChatbotSheetState();
}

class _AgenticAIChatbotSheetState extends State<AgenticAIChatbotSheet> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'ai',
      'text': 'Salam & Hello Airiel! I am your SmartCRM Autonomous Copilot. I continuously monitor bays, customer retention cycles, and incoming WhatsApp inquiries.\n\nCurrently tracking 186 fleet vehicles with 18 overdue intervals and RM 8,420 in recoverable churn revenue. How can I assist floor operations right now?',
      'time': 'Just now',
      'actions': [
        {'label': '🔥 Overdue Cars', 'query': 'Show me overdue vehicles', 'tab': 3},
        {'label': '🔧 Bay Occupancy', 'query': 'What is our current bay occupancy?', 'tab': 1},
        {'label': '💬 Inbound WhatsApp', 'query': 'Check WhatsApp customer inquiries', 'tab': 2},
      ]
    }
  ];

  final List<String> _quickSuggestions = [
    'Overdue Myvi & Bezza',
    'Bay 1-4 active status',
    'High churn risk accounts',
    'Repeat-service rate',
    'Staged AC flush quote',
  ];

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> _handleSend([String? presetQuery]) async {
    final query = presetQuery ?? _inputController.text.trim();
    if (query.isEmpty || _isLoading) return;

    setState(() {
      _messages.add({
        'role': 'user',
        'text': query,
        'time': 'Now',
      });
      _inputController.clear();
      _isLoading = true;
    });
    _scrollToBottom();

    final reply = await ApiService.copilotChat(query);

    List<Map<String, dynamic>> actions = [];
    final lower = query.toLowerCase();
    if (lower.contains('bay') || lower.contains('occupan')) {
      actions.add({'label': '🔧 Jump to Bays Tab', 'tab': 1});
    }
    if (lower.contains('overdue') || lower.contains('customer') || lower.contains('fleet')) {
      actions.add({'label': '🚗 View Fleet Directory', 'tab': 3});
    }
    if (lower.contains('reminder') || lower.contains('whatsapp')) {
      actions.add({'label': '💬 View Reminders', 'tab': 2});
    }

    if (mounted) {
      setState(() {
        _messages.add({
          'role': 'ai',
          'text': reply,
          'time': 'Now',
          'actions': actions,
        });
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.auto_awesome_rounded, color: Color(0xFFF59E0B), size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Text(
                            'SmartCRM Agentic AI',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A)),
                          ),
                          SizedBox(width: 6),
                          PulsingDot(color: Color(0xFF10B981), size: 6),
                        ],
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Autonomous Workshop Floor Copilot • CAT405',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 20),

          // Suggestion Chips Carousel
          SizedBox(
            height: 34,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _quickSuggestions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final suggestion = _quickSuggestions[idx];
                return BouncingTouchCard(
                  onTap: () => _handleSend(suggestion),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Center(
                      child: Text(
                        suggestion,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),

          // Messages List
          Expanded(
            child: Container(
              color: const Color(0xFFF8FAFC),
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, idx) {
                  final msg = _messages[idx];
                  final isUser = msg['role'] == 'user';

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Column(
                      crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Container(
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.84),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isUser ? const Color(0xFF1E293B) : Colors.white,
                            borderRadius: BorderRadius.circular(16).copyWith(
                              bottomRight: isUser ? const Radius.circular(2) : const Radius.circular(16),
                              bottomLeft: !isUser ? const Radius.circular(2) : const Radius.circular(16),
                            ),
                            border: isUser ? null : Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg['text'] ?? '',
                                style: TextStyle(
                                  color: isUser ? Colors.white : const Color(0xFF0F172A),
                                  fontSize: 12.5,
                                  height: 1.45,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                msg['time'] ?? '',
                                style: TextStyle(
                                  fontSize: 9.5,
                                  color: isUser ? Colors.grey.shade400 : Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Action Buttons attached to AI message
                        if (msg['actions'] != null && (msg['actions'] as List).isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: (msg['actions'] as List).map<Widget>((act) {
                              return BouncingTouchCard(
                                onTap: () {
                                  if (act['tab'] != null && widget.onNavigateTab != null) {
                                    Navigator.pop(context);
                                    widget.onNavigateTab!(act['tab']);
                                  } else if (act['query'] != null) {
                                    _handleSend(act['query']);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFCBD5E1)),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        act['label'] ?? '',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF3B82F6)),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
          ),

          if (_isLoading)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: const Color(0xFFF8FAFC),
              child: Row(
                children: const [
                  PulsingDot(color: Color(0xFF3B82F6), size: 6),
                  SizedBox(width: 8),
                  Text('Agentic AI querying workshop data...', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                ],
              ),
            ),

          // Input Row
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: TextField(
                      controller: _inputController,
                      decoration: const InputDecoration(
                        hintText: 'Ask AI (e.g. Bay status, Overdue cars)...',
                        hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                      ),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                BouncingTouchCard(
                  onTap: () => _handleSend(),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Color(0xFF1E293B),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
