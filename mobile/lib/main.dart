import 'package:flutter/material.dart';
import 'screens/bays_screen.dart';
import 'screens/intake_screen.dart';
import 'screens/retention_screen.dart';
import 'screens/fleet_screen.dart';

void main() {
  runApp(const SmartCRMMobileApp());
}

class SmartCRMMobileApp extends StatelessWidget {
  const SmartCRMMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCRM Floor PIC',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: Colors.amber,
        colorScheme: ColorScheme.dark(
          primary: Colors.amber,
          secondary: Colors.amber.shade700,
          surface: const Color(0xFF1E293B),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainFloorNavigation(),
    );
  }
}

class MainFloorNavigation extends StatefulWidget {
  const MainFloorNavigation({Key? key}) : super(key: key);

  @override
  State<MainFloorNavigation> createState() => _MainFloorNavigationState();
}

class _MainFloorNavigationState extends State<MainFloorNavigation> {
  int _currentIndex = 0;
  String? _preselectedBay;

  void _navigateTab(int index, {String? defaultBay}) {
    setState(() {
      _currentIndex = index;
      _preselectedBay = defaultBay;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      BaysScreen(onNavigateTab: _navigateTab),
      IntakeScreen(
        initialBay: _preselectedBay,
        onIntakeCreated: () => _navigateTab(0), // return to Bays screen after check-in
      ),
      const RetentionScreen(),
      const FleetScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: const Color(0xFF1E293B),
          indicatorColor: Colors.amber.withOpacity(0.2),
          labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold);
            }
            return const TextStyle(color: Colors.white54, fontSize: 11);
          }),
          iconTheme: WidgetStateProperty.resolveWith<IconThemeData>((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: Colors.amber, size: 22);
            }
            return const IconThemeData(color: Colors.white54, size: 22);
          }),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.car_repair_outlined),
              selectedIcon: Icon(Icons.car_repair_rounded),
              label: 'Bays',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_circle_outline_rounded),
              selectedIcon: Icon(Icons.add_circle_rounded),
              label: 'Check-In',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline_rounded),
              selectedIcon: Icon(Icons.chat_bubble_rounded),
              label: 'WhatsApp',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_rounded),
              selectedIcon: Icon(Icons.person_search_rounded),
              label: 'Directory',
            ),
          ],
        ),
      ),
    );
  }
}
